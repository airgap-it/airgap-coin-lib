import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'

import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { RawTezosTransaction } from '../../../serializer/unsigned-transactions/tezos-transactions.serializer'
import { ICoinSubProtocol, SubProtocolType } from '../../ICoinSubProtocol'
import { TezosOperation, TezosOperationType, TezosProtocol, TezosSpendOperation, TezosWrappedOperation } from '../TezosProtocol'

export class TezosKtProtocol extends TezosProtocol implements ICoinSubProtocol {
  public identifier: string = 'xtz-kt'
  public isSubProtocol: boolean = true
  public subProtocolType: SubProtocolType = SubProtocolType.ACCOUNT
  public addressValidationPattern: string = '^(tz1|KT1)[1-9A-Za-z]{33}$'
  public migrationFee: BigNumber = new BigNumber(2941)

  public async getAddressFromPublicKey(publicKey: string): Promise<string> {
    return (await this.getAddressesFromPublicKey(publicKey))[0]
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const tz1address = await super.getAddressFromPublicKey(publicKey)
    const getRequestBody = (field: string, set: string) => {
      return {
        predicates: [
          {
            field,
            operation: 'eq',
            set: [tz1address],
            inverse: false
          },
          {
            field: 'kind',
            operation: 'eq',
            set: [set],
            inverse: false
          },
          {
            field: 'status',
            operation: 'eq',
            set: ['applied'],
            inverse: false
          }
        ]
      }
    }
    const { data } = await axios.post(
      `${this.baseApiUrl}/v2/data/tezos/mainnet/operations`,
      getRequestBody('manager_pubkey', 'origination'),
      {
        headers: this.headers
      }
    )
    const ktAddresses: string[] = data.map((origination: { originated_contracts: string }) => {
      return origination.originated_contracts
    })
    return ktAddresses.reverse()
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
    throw new Error('sending funds from KT addresses is not supported. Please use the migration feature.')
  }

  public async originate(publicKey: string, delegate?: string, amount?: BigNumber): Promise<RawTezosTransaction> {
    throw new Error('Originate operation not supported for KT Addresses')
  }

  public async delegate(publicKey: string, delegate?: string): Promise<RawTezosTransaction> {
    throw new Error('Delegate operation not supported for KT Addresses')
  }

  public async migrateKtContract(
    publicKey: string,
    destinationContract: string
  ): Promise<{
    binaryTransaction: string
  }> {
    let counter: BigNumber = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []

    const address: string = await super.getAddressFromPublicKey(publicKey)

    const balanceOfManager: BigNumber = await super.getBalanceOfAddresses([address])

    if (balanceOfManager.isLessThan(this.migrationFee)) {
      throw new Error('not enough balance on tz address for fee')
    }

    const amount: BigNumber = await this.getBalanceOfAddresses([destinationContract])

    try {
      const results: AxiosResponse[] = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager: string = results[2].data

      // check if we have revealed the address already
      if (!accountManager) {
        operations.push(await this.createRevealOperation(counter, publicKey, address))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const hexAmount: string = `00${this.encodeSignedInt(amount.toNumber())}`

    let hexDestination: string = this.checkAndRemovePrefixToHex(address, this.tezosPrefixes.tz1)

    if (hexDestination.length > 42) {
      // must be less or equal 21 bytes
      throw new Error('provided source is invalid')
    }

    while (hexDestination.length !== 42) {
      // fill up with 0s to match 21 bytes
      hexDestination = `0${hexDestination}`
    }

    const lengthOfArgument: number = 32 + hexDestination.length / 2 + hexAmount.length / 2
    const lengthOfSequence: number = lengthOfArgument - 5

    let hexArgumentLength: string = lengthOfArgument.toString(16)
    let hexSequenceLength: string = lengthOfSequence.toString(16)

    while (hexArgumentLength.length < 8) {
      // Make sure it's 4 bytes
      hexArgumentLength = `0${hexArgumentLength}`
    }

    while (hexSequenceLength.length < 8) {
      // Make sure it's 4 bytes
      hexSequenceLength = `0${hexSequenceLength}`
    }

    // Taken from https://blog.nomadic-labs.com/babylon-update-instructions-for-delegation-wallet-developers.html#transfer-from-a-managertz-smart-contract-to-an-implicit-tz-account

    // tslint:disable:prefer-template
    const code: string =
      'ff' + // 0xff (or any other non-null byte): presence flag for the parameters (entrypoint and argument)
      '02' + // 0x02: tag of the "%do" entrypoint
      hexArgumentLength + // <4 bytes>: length of the argument
      '02' + // 0x02: Michelson sequence
      hexSequenceLength + // <4 bytes>: length of the sequence
      '0320' + // 0x0320: DROP
      '053d' + // 0x053d: NIL
      '036d' + // 0x036d: operation
      '0743' + // 0x0743: PUSH
      '035d' + // 0x035d: key_hash
      '0a' + // 0x0a: Byte sequence
      '00000015' + // 0x00000015: Length of the sequence (21 bytes)
      hexDestination + // <21 bytes>: <destination>
      '031e' + // 0x031e: IMPLICIT_ACCOUNT
      '0743' + // 0x0743: PUSH
      '036a' + // 0x036a: mutez
      hexAmount + // <amount>: Amout to be transfered
      '034f' + // 0x034f: UNIT
      '034d' + // 0x034d: TRANSFER_TOKENS
      '031b' // 0x031b: CONS
    // tslint:enable:prefer-template

    const spendOperation: TezosSpendOperation = {
      kind: TezosOperationType.TRANSACTION,
      fee: this.migrationFee.toFixed(),
      gas_limit: '26283',
      storage_limit: '0',
      amount: '0',
      counter: counter.toFixed(),
      destination: destinationContract,
      source: address,
      code
    }

    operations.push(spendOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch,
        contents: operations
      }

      const binaryTx: string = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }
}
