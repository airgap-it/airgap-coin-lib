import { IAirGapTransaction } from '../../..'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { RawTezosTransaction } from '../../../serializer/types'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { MichelsonAddress } from '../types/michelson/primitives/MichelsonAddress'
import { MichelsonBytes } from '../types/michelson/primitives/MichelsonBytes'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'
import { MichelsonString } from '../types/michelson/primitives/MichelsonString'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosTransactionParameters } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'

import { TezosFAProtocol, TezosFAProtocolConfiguration } from './TezosFAProtocol'

enum FA12ContractEntrypointName {
  BALANCE = 'getBalance',
  ALLOWANCE = 'getAllowance',
  APPROVE = 'approve',
  TRANSFER = 'transfer',
  TOTAL_SUPPLY = 'getTotalSupply',
  TOTAL_MINTED = 'getTotalMinted',
  TOTAL_BURNED = 'getTotalBurned'
}

export class TezosFA12Protocol extends TezosFAProtocol {
  constructor(configuration: TezosFAProtocolConfiguration) {
    super({
      callbackDefaults: [
        [TezosNetwork.MAINNET, 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u'],
        [TezosNetwork.CARTHAGENET, 'KT1J8FmFLSgMz5H2vexFmsCtTLVod9V49iyW']
      ],
      ...configuration
    })
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const promises: Promise<string>[] = []
    for (const address of addresses) {
      promises.push(this.getBalance(address, this.defaultSourceAddress))
    }
    const results: string[] = await Promise.all(promises)

    return results.reduce((current, next) => current.plus(new BigNumber(next)), new BigNumber(0)).toFixed()
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    // return this.feeDefaults
    if (recipients.length !== values.length) {
      throw new Error('length of recipients and values does not match!')
    }
    const transferCalls = await this.createTransferCalls(publicKey, recipients, values, this.feeDefaults.medium, data)
    const operations: TezosOperation[] = transferCalls.map((transferCall: TezosContractCall) => {
      return {
        kind: TezosOperationType.TRANSACTION,
        amount: '0',
        destination: this.contractAddress,
        parameters: transferCall.toJSON(),
        fee: '0'
      }
    })

    return this.estimateFeeDefaultsForOperations(publicKey, operations)
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
    const transferCalls = await this.createTransferCalls(publicKey, recipients, values, fee, data)

    return this.prepareContractCall(transferCalls, fee, publicKey)
  }

  public async transactionDetailsFromParameters(parameters: TezosTransactionParameters): Promise<Partial<IAirGapTransaction>[]> {
    if (parameters.entrypoint !== FA12ContractEntrypointName.TRANSFER) {
      throw new Error('Only calls to the transfer entrypoint can be converted to IAirGapTransaction')
    }
    const contractCall: TezosContractCall = await this.contract.parseContractCall(parameters)
    const amount: BigNumber | undefined = contractCall.argument<MichelsonInt>('value')?.value

    const fromAddress: MichelsonString | MichelsonBytes | undefined = contractCall.argument<MichelsonAddress>('from')?.address
    let from: string | undefined
    if (fromAddress && Buffer.isBuffer(fromAddress.value)) {
      from = TezosUtils.parseAddress(fromAddress.value.toString('hex'))
    } else if (fromAddress && typeof fromAddress.value === 'string') {
      from = fromAddress.value
    }

    const toAddress: MichelsonString | MichelsonBytes | undefined = contractCall.argument<MichelsonAddress>('to')?.address
    let to: string | undefined
    if (toAddress && Buffer.isBuffer(toAddress.value)) {
      to = TezosUtils.parseAddress(toAddress?.value.toString('hex')) 
    } else if (toAddress && typeof toAddress.value === 'string') {
      to = toAddress.value
    }

    return [{
      amount: new BigNumber(amount || NaN).toFixed(), // in tzbtc
      from: [from || ''],
      to: [to || '']
    }]
  }

  public async getBalance(address: string, source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    const getBalanceCall = await this.contract.createContractCall(FA12ContractEntrypointName.BALANCE, [{
      owner: address
    }, callbackContract])

    return this.runContractCall(getBalanceCall, this.requireSource(source, address, 'kt'))
  }

  public async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
    callbackContract: string = this.callbackContract(),
    source?: string
  ): Promise<string> {
    const getAllowanceCall = await this.contract.createContractCall(FA12ContractEntrypointName.ALLOWANCE, [{
      owner: ownerAddress,
      spender: spenderAddress
    }, callbackContract])

    return this.runContractCall(getAllowanceCall, this.requireSource(source, spenderAddress, 'kt'))
  }

  public async getTotalSupply(source?: string, callbackContract: string = this.callbackContract()) {
    const getTotalSupplyCall = await this.contract.createContractCall(FA12ContractEntrypointName.TOTAL_SUPPLY, [
      [], 
      callbackContract
    ])

    return this.runContractCall(getTotalSupplyCall, this.requireSource(source))
  }

  public async getTotalMinted(source?: string, callbackContract: string = this.callbackContract()) {
    const getTotalMintedCall = await this.contract.createContractCall(FA12ContractEntrypointName.TOTAL_MINTED, [
      [],
      callbackContract
    ])

    return this.runContractCall(getTotalMintedCall, this.requireSource(source))
  }

  public async getTotalBurned(source?: string, callbackContract: string = this.callbackContract()) {
    const getTotalBurnedCall = await this.contract.createContractCall(FA12ContractEntrypointName.TOTAL_BURNED, [
      [],
      callbackContract
    ])

    return this.runContractCall(getTotalBurnedCall, this.requireSource(source))
  }

  public async transfer(
    fromAddress: string,
    toAddress: string,
    amount: string,
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const transferCall = await this.contract.createContractCall(FA12ContractEntrypointName.TRANSFER, {
      from: fromAddress,
      to: toAddress,
      value: new BigNumber(amount).toNumber()
    })

    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public async approve(spenderAddress: string, amount: string, fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const approveCall = await this.contract.createContractCall(FA12ContractEntrypointName.APPROVE, {
      spender: spenderAddress,
      value: new BigNumber(amount).toNumber()
    })

    return this.prepareContractCall([approveCall], fee, publicKey)
  }

  private async createTransferCalls(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number }
  ): Promise<TezosContractCall[]> {
    if (recipients.length !== values.length) {
      throw new Error('length of recipients and values does not match!')
    }

    // check if we got an address-index
    const addressIndex: number = data && data.addressIndex ? data.addressIndex : 0
    const addresses: string[] = await this.getAddressesFromPublicKey(publicKey)

    if (!addresses[addressIndex]) {
      throw new Error('no kt-address with this index exists')
    }

    const fromAddress: string = addresses[addressIndex]

    const transferCalls: TezosContractCall[] = []
    for (let i: number = 0; i < recipients.length; i++) {
      const transferCall = await this.contract.createContractCall(FA12ContractEntrypointName.TRANSFER, {
        from: fromAddress,
        to: recipients[i],
        value: new BigNumber(values[i]).toNumber()
      })
      transferCalls.push(transferCall)
    }

    return transferCalls
  }
}