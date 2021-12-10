import { IAirGapTransaction } from '../../..'
import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { RawTezosTransaction } from '../../../serializer/types'
import { isHex } from '../../../utils/hex'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosAddress } from '../TezosAddress'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { MichelsonPair } from '../types/michelson/generics/MichelsonPair'
import { MichelsonAddress } from '../types/michelson/primitives/MichelsonAddress'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'
import { TezosOperation } from '../types/operations/TezosOperation'
import { TezosTransactionParameters } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'
import { isMichelinePrimitive } from '../types/utils'
import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosFAProtocolOptions } from './TezosFAProtocolOptions'
import { ConditionViolationError, NotFoundError } from '../../../errors'
import { Domain } from '../../../errors/coinlib-error'

enum TezosFA1ContractEntrypoint {
  BALANCE = 'getBalance',
  TRANSFER = 'transfer',
  TOTAL_SUPPLY = 'getTotalSupply'
}

export class TezosFA1Protocol extends TezosFAProtocol {
  private readonly defaultCallbackContractMap: Partial<Record<TezosNetwork, string>>

  constructor(options: TezosFAProtocolOptions) {
    super(options)
    this.defaultCallbackContractMap = {
      [TezosNetwork.MAINNET]: 'KT19ptNzn4MVAN45KUUNpyL5AdLVhujk815u',
      [TezosNetwork.GRANADANET]: 'KT1QcauKB7fXaVBh1qWSt5nsfYe4GBo8jJjg',
      [TezosNetwork.HANGZHOUNET]: 'KT1VY8ggaVFzKEMHh4dS4zigy7b33nKrT1Mh'
    }
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
      throw new ConditionViolationError(Domain.TEZOSFA, 'length of recipients and values does not match!')
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

  public transactionDetailsFromParameters(parameters: TezosTransactionParameters): Partial<IAirGapTransaction>[] {
    const defaultDetails = {
      extra: {
        type: parameters.entrypoint
      }
    }

    if (parameters.entrypoint !== TezosFA1ContractEntrypoint.TRANSFER) {
      console.warn('Only calls to the transfer entrypoint can be converted to IAirGapTransaction')

      return [defaultDetails]
    }

    try {
      const callArguments = MichelsonPair.from(
        parameters.value,
        undefined,
        (fromJSON: string) => MichelsonAddress.from(fromJSON, 'from'),
        (pairJSON: string) =>
          MichelsonPair.from(
            pairJSON,
            undefined,
            (toJSON: string) => MichelsonAddress.from(toJSON, 'to'),
            (valueJSON: string) => MichelsonInt.from(valueJSON, 'value')
          )
      ).asRawValue()

      if (!this.isTransferRequest(callArguments)) {
        return [defaultDetails]
      }

      return [
        {
          ...defaultDetails,
          amount: callArguments.value.toFixed(), // in tzbtc
          from: [isHex(callArguments.from) ? TezosUtils.parseAddress(callArguments.from) : callArguments.from],
          to: [isHex(callArguments.to) ? TezosUtils.parseAddress(callArguments.to) : callArguments.to]
        }
      ]
    } catch {
      return [defaultDetails]
    }
  }

  public async getBalance(address: string, source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    const getBalanceCall = await this.contract.createContractCall(TezosFA1ContractEntrypoint.BALANCE, [
      {
        owner: address
      },
      callbackContract
    ])

    return this.getContractCallIntResult(getBalanceCall, this.requireSource(source, address, 'kt'))
  }

  public async getTotalSupply(source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    const getTotalSupplyCall = await this.contract.createContractCall(TezosFA1ContractEntrypoint.TOTAL_SUPPLY, [[], callbackContract])

    return this.getContractCallIntResult(getTotalSupplyCall, this.requireSource(source))
  }

  public async transfer(
    fromAddress: string,
    toAddress: string,
    amount: string,
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const transferCall = await this.contract.createContractCall(TezosFA1ContractEntrypoint.TRANSFER, {
      from: fromAddress,
      to: toAddress,
      value: new BigNumber(amount).toNumber()
    })

    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    // there is no standard way to fetch token holders for now, every subclass needs to implement its own logic
    return []
  }

  protected async getContractCallIntResult(transferCall: TezosContractCall, source: string): Promise<string> {
    try {
      const operationResult = await this.runContractCall(transferCall, source)

      if (isMichelinePrimitive('int', operationResult)) {
        return operationResult.int
      }
    } catch {}

    return '0'
  }

  private async createTransferCalls(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number }
  ): Promise<TezosContractCall[]> {
    if (recipients.length !== values.length) {
      throw new ConditionViolationError(Domain.TEZOSFA, 'length of recipients and values does not match!')
    }

    // check if we got an address-index
    const addressIndex: number = data && data.addressIndex !== undefined ? data.addressIndex : 0
    const addresses: string[] = (await this.getAddressesFromPublicKey(publicKey)).map((address: TezosAddress) => address.getValue())

    if (!addresses[addressIndex]) {
      throw new NotFoundError(Domain.TEZOSFA, `no kt-address with index ${addressIndex} exists`)
    }

    const fromAddress: string = addresses[addressIndex]

    const transferCalls: TezosContractCall[] = []
    for (let i: number = 0; i < recipients.length; i++) {
      const transferCall = await this.contract.createContractCall(TezosFA1ContractEntrypoint.TRANSFER, {
        from: fromAddress,
        to: recipients[i],
        value: new BigNumber(values[i]).toNumber()
      })
      transferCalls.push(transferCall)
    }

    return transferCalls
  }

  protected callbackContract(): string {
    return this.defaultCallbackContractMap[this.options.network.extras.network] ?? ''
  }

  private isTransferRequest(obj: unknown): obj is { from: string; to: string; value: BigNumber } {
    const anyObj: any = obj as any

    return (
      anyObj instanceof Object && typeof anyObj.from === 'string' && typeof anyObj.to === 'string' && BigNumber.isBigNumber(anyObj.value)
    )
  }
}
