import { FeeDefaults, ICoinSubProtocol, ProtocolSymbols, SubProtocolSymbols, SubProtocolType } from '@airgap/coinlib-core'
import axios, { AxiosError, AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  BalanceError,
  InvalidValueError,
  NetworkError,
  NotFoundError,
  NotImplementedError,
  OperationFailedError
} from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'

import { RawTezosTransaction } from '../../types/transaction-tezos'
import { TezosProtocol } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { TezosKtAddressCursor } from '../types/kt/TezosKtAddressCursor'
import { TezosKtAddressResult } from '../types/kt/TezosKtAddressResult'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosTransactionOperation } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'
import { TezosWrappedOperation } from '../types/TezosWrappedOperation'

import { TezosKtAddress } from './TezosKtAddress'

const INDEX_LIMIT: number = 10000

export class TezosKtProtocol extends TezosProtocol implements ICoinSubProtocol {
  public identifier: ProtocolSymbols = SubProtocolSymbols.XTZ_KT
  public isSubProtocol: boolean = true
  public subProtocolType: SubProtocolType = SubProtocolType.ACCOUNT
  public addressValidationPattern: string = '^(tz1|KT1)[1-9A-Za-z]{33}$'

  public migrationFee: BigNumber = new BigNumber(5000)

  public async getIsSubProtocol(): Promise<boolean> {
    return this.isSubProtocol
  }

  public async getSubProtocolType(): Promise<SubProtocolType> {
    return this.subProtocolType
  }

  public async getContractAddress(): Promise<string | undefined> {
    return undefined
  }

  public async getAddressFromPublicKey(publicKey: string, cursor?: TezosKtAddressCursor): Promise<TezosKtAddressResult> {
    const addresses = await this.getAddressesFromPublicKey(publicKey)
    const index = cursor?.index ?? 0
    if (index >= addresses.length) {
      throw new NotFoundError(Domain.TEZOS, 'No address for the specified index exists')
    }

    return addresses[index]
  }

  public async getAddressesFromPublicKey(publicKey: string, cursor?: TezosKtAddressCursor): Promise<TezosKtAddressResult[]> {
    const tz1address: string = (await super.getAddressFromPublicKey(publicKey)).address
    const startIndex: number = cursor?.index ?? 0
    const ktAddresses: string[] = await this.options.network.extras.indexerClient.getDelegatorContracts(tz1address, INDEX_LIMIT)

    const addresses = await Promise.all(
      ktAddresses.reverse().map(async (ktAddress: string, index: number) => {
        const address: TezosKtAddress = await TezosKtAddress.from(ktAddress)

        return {
          address: address.asString(),
          cursor: {
            hasNext: index < INDEX_LIMIT - 1,
            index
          }
        }
      })
    )

    return addresses.slice(startIndex)
  }

  public async estimateMaxTransactionValueFromPublicKey(
    publicKey: string,
    recipients: string[],
    fee?: string,
    data?: { addressIndex?: number }
  ): Promise<string> {
    const address = await this.getAddressFromPublicKey(
      publicKey,
      data?.addressIndex
        ? {
            hasNext: data.addressIndex < INDEX_LIMIT - 1,
            index: data.addressIndex
          }
        : undefined
    )

    return this.getBalanceOfAddresses([address.address])
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    const fee = this.migrationFee.shiftedBy(-this.feeDecimals).toFixed()

    return {
      low: fee,
      medium: fee,
      high: fee
    }
  }

  public async prepareTransactionFromPublicKey(
    _publicKey: string,
    _recipients: string[],
    _values: string[],
    _fee: string,
    _data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
    throw new NotImplementedError(Domain.TEZOS, 'sending funds from KT addresses is not supported. Please use the migration feature.')
  }

  public async originate(publicKey: string, delegate?: string, amount?: BigNumber): Promise<RawTezosTransaction> {
    throw new NotImplementedError(Domain.TEZOS, 'Originate operation not supported for KT Addresses')
  }

  public async delegate(publicKey: string, delegate?: string): Promise<RawTezosTransaction> {
    throw new NotImplementedError(Domain.TEZOS, 'Delegate operation not supported for KT Addresses')
  }

  public async migrateKtContract(
    publicKey: string,
    destinationContract: string
  ): Promise<{
    binaryTransaction: string
  }> {
    let counter: BigNumber = new BigNumber(1)
    let branch: string = ''

    const operations: TezosOperation[] = []

    const address: string = (await super.getAddressFromPublicKey(publicKey)).address

    const balanceOfManager: BigNumber = new BigNumber(await super.getBalanceOfAddresses([address]))

    if (balanceOfManager.isLessThan(this.migrationFee)) {
      throw new BalanceError(Domain.TEZOS, 'not enough balance on tz address for fee')
    }

    const amount: BigNumber = new BigNumber(await this.getBalanceOfAddresses([destinationContract]))

    const results: AxiosResponse[] = (await Promise.all([
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head~2/hash`),
      axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
    ]).catch((error) => {
      if (error.response && error.response.status !== 404) {
        throw new NetworkError(Domain.TEZOS, error as AxiosError)
      }
    })) as AxiosResponse[]

    counter = new BigNumber(results[0].data).plus(1)
    branch = results[1].data

    const accountManager: string = results[2].data

    // check if we have revealed the address already
    if (!accountManager) {
      operations.push(await this.createRevealOperation(counter, publicKey, address))
      counter = counter.plus(1)
    }

    let hexDestination: string = this.checkAndRemovePrefixToHex(address, TezosUtils.tezosPrefixes.tz1)

    if (hexDestination.length > 42) {
      // must be less or equal 21 bytes
      throw new InvalidValueError(Domain.TEZOS, 'provided source is invalid')
    }

    while (hexDestination.length !== 42) {
      // fill up with 0s to match 21 bytes
      hexDestination = `0${hexDestination}`
    }

    // Taken from https://blog.nomadic-labs.com/babylon-update-instructions-for-delegation-wallet-developers.html#transfer-from-a-managertz-smart-contract-to-an-implicit-tz-account
    const spendOperation: TezosTransactionOperation = {
      kind: TezosOperationType.TRANSACTION,
      fee: this.migrationFee.toFixed(),
      gas_limit: '26283',
      storage_limit: '0',
      amount: '0',
      counter: counter.toFixed(),
      destination: destinationContract,
      source: address,
      parameters: {
        entrypoint: 'do',
        value: [
          { prim: 'DROP' },
          { prim: 'NIL', args: [{ prim: 'operation' }] },
          {
            prim: 'PUSH',
            args: [
              { prim: 'key_hash' },
              {
                bytes: hexDestination
              }
            ]
          },
          { prim: 'IMPLICIT_ACCOUNT' },
          {
            prim: 'PUSH',
            args: [{ prim: 'mutez' }, { int: amount.toString(10) }]
          },
          { prim: 'UNIT' },
          { prim: 'TRANSFER_TOKENS' },
          { prim: 'CONS' }
        ]
      }
    }

    operations.push(spendOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch,
        contents: operations
      }

      const binaryTx: string = await this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error: any) {
      console.warn(error.message)
      throw new OperationFailedError(Domain.TEZOS, 'Forging Tezos TX failed.')
    }
  }
}
