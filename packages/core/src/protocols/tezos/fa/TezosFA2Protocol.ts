import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { isHex } from '../../../utils/hex'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosAddress } from '../TezosAddress'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { TezosFA2BalanceOfRequest } from '../types/fa/TezosFA2BalanceOfRequest'
import { TezosFA2BalanceOfResponse } from '../types/fa/TezosFA2BalanceOfResponse'
import { TezosFA2TransferRequest } from '../types/fa/TezosFA2TransferRequest'
import { TezosFA2UpdateOperatorRequest } from '../types/fa/TezosFA2UpdateOperatorRequest'
import { MichelineDataNode } from '../types/micheline/MichelineNode'
import { MichelsonList } from '../types/michelson/generics/MichelsonList'
import { MichelsonPair } from '../types/michelson/generics/MichelsonPair'
import { MichelsonAddress } from '../types/michelson/primitives/MichelsonAddress'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'
import { MichelsonString } from '../types/michelson/primitives/MichelsonString'
import { TezosTransactionParameters } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'
import { isMichelineSequence } from '../types/utils'
import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosFA2ProtocolConfig, TezosFA2ProtocolOptions } from './TezosFAProtocolOptions'
import { ConditionViolationError, NotFoundError } from '../../../errors'
import { Domain } from '../../../errors/coinlib-error'
import { TezosFATokenMetadata } from '../types/fa/TezosFATokenMetadata'
import { ConseilPredicate } from '../types/contract/ConseilPredicate'

enum TezosFA2ContractEntrypoint {
  BALANCE = 'balance_of',
  TRANSFER = 'transfer',
  UPDATE_OPERATORS = 'update_operators'
}

export class TezosFA2Protocol extends TezosFAProtocol {
  public readonly defaultTokenID: number

  private readonly defaultCallbackContract: Partial<Record<TezosNetwork, Partial<Record<TezosFA2ContractEntrypoint, string>>>>

  constructor(options: TezosFA2ProtocolOptions) {
    super(options)

    this.defaultTokenID = options.config.defaultTokenID ?? 0

    this.defaultCallbackContract = {
      [TezosNetwork.MAINNET]: {
        [TezosFA2ContractEntrypoint.BALANCE]: 'KT1LyHDYnML5eCuTEVCTynUpivwG6ns6khiG'
      },
      [TezosNetwork.EDONET]: {
        [TezosFA2ContractEntrypoint.BALANCE]: 'KT1UEyZsmSga2KcNkpGbWX6nvGAVHtBpT5is'
      },
      [TezosNetwork.GRANADANET]: {
        [TezosFA2ContractEntrypoint.BALANCE]: 'KT1Az142aocNmJYaJKBbtLGY2khUSgYTRieG'
      }
    }
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const results: TezosFA2BalanceOfResponse[] = await this.balanceOf(
      addresses.map((address: string) => {
        return {
          address,
          tokenID: this.defaultTokenID
        }
      }, this.defaultSourceAddress)
    )

    return results.reduce((sum: BigNumber, next: TezosFA2BalanceOfResponse) => sum.plus(next.amount), new BigNumber(0)).toFixed()
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    // return this.feeDefaults
    if (recipients.length !== values.length) {
      throw new ConditionViolationError(Domain.TEZOS, 'length of recipients and values does not match!')
    }

    const transferCall: TezosContractCall = await this.createTransferCall(publicKey, recipients, values, this.feeDefaults.medium, data)
    const operation = {
      kind: TezosOperationType.TRANSACTION,
      amount: '0',
      destination: this.contractAddress,
      parameters: transferCall.toJSON(),
      fee: '0'
    }

    return this.estimateFeeDefaultsForOperations(publicKey, [operation])
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: any
  ): Promise<RawTezosTransaction> {
    const transferCall: TezosContractCall = await this.createTransferCall(publicKey, recipients, values, fee, data)

    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public transactionDetailsFromParameters(parameters: TezosTransactionParameters): Partial<IAirGapTransaction>[] {
    const defaultDetails = {
      extra: {
        type: parameters.entrypoint
      }
    }

    if (parameters.entrypoint !== TezosFA2ContractEntrypoint.TRANSFER) {
      console.warn('Only calls to the transfer entrypoint can be converted to IAirGapTransaction')

      return [defaultDetails]
    }

    try {
      const callArgumentsList = MichelsonList.from(parameters.value, (pairJSON: string) =>
        MichelsonPair.from(
          pairJSON,
          undefined,
          (fromJSON: string) => MichelsonAddress.from(fromJSON, 'from_'),
          (txsJSON: string) =>
            MichelsonList.from(
              txsJSON,
              (pairJSON: string) =>
                MichelsonPair.from(
                  pairJSON,
                  undefined,
                  (toJSON: string) => MichelsonAddress.from(toJSON, 'to_'),
                  (pairJSON: string) =>
                    MichelsonPair.from(
                      pairJSON,
                      undefined,
                      (tokenJSON: string) => MichelsonInt.from(tokenJSON, 'token_id'),
                      (amountJSON: string) => MichelsonInt.from(amountJSON, 'amount')
                    )
                ),
              'txs'
            )
        )
      ).asRawValue()

      return Array.isArray(callArgumentsList)
        ? callArgumentsList
            .map((callArguments: unknown) => {
              if (!this.isTransferRequest(callArguments)) {
                return []
              }

              const from: string = isHex(callArguments.from_) ? TezosUtils.parseAddress(callArguments.from_) : callArguments.from_

              const transferDetails: [string, BigNumber, BigNumber][] = callArguments.txs.map((tx) => {
                const to: string = isHex(tx.to_) ? TezosUtils.parseAddress(tx.to_) : tx.to_

                return [to, tx.token_id, tx.amount] as [string, BigNumber, BigNumber]
              })

              return transferDetails
                .map(([to, tokenID, amount]: [string, BigNumber, BigNumber]) => {
                  if (!tokenID.eq(this.defaultTokenID)) {
                    return undefined
                  }

                  return {
                    ...defaultDetails,
                    amount: amount.toFixed(),
                    from: [from],
                    to: [to],
                    extra: {
                      type: parameters.entrypoint,
                      assetID: tokenID.toNumber()
                    }
                  }
                })
                .filter((partialDetails: Partial<IAirGapTransaction> | undefined) => partialDetails !== undefined) as IAirGapTransaction[]
            })
            .reduce((flatten: Partial<IAirGapTransaction>[], next: Partial<IAirGapTransaction>[]) => flatten.concat(next), [])
        : [defaultDetails]
    } catch {
      return [defaultDetails]
    }
  }

  public async balanceOf(
    balanceRequests: TezosFA2BalanceOfRequest[],
    source?: string,
    callbackContract: string = this.callbackContract(TezosFA2ContractEntrypoint.BALANCE)
  ): Promise<TezosFA2BalanceOfResponse[]> {
    const balanceOfCall: TezosContractCall = await this.contract.createContractCall(TezosFA2ContractEntrypoint.BALANCE, {
      requests: balanceRequests.map((request: TezosFA2BalanceOfRequest) => {
        return {
          owner: request.address,
          token_id: request.tokenID
        }
      }),
      callback: callbackContract
    })

    const results: MichelineDataNode = await this.runContractCall(balanceOfCall, this.requireSource(source))
    if (isMichelineSequence(results)) {
      return results
        .map((node: MichelineDataNode) => {
          try {
            const pair: MichelsonPair = MichelsonPair.from(
              node,
              undefined,
              (value: unknown) => MichelsonPair.from(value, undefined, MichelsonAddress.from, MichelsonInt.from),
              MichelsonInt.from
            )

            const accountWithTokenID: MichelsonPair = MichelsonPair.from(pair.items[0].get())
            const account: MichelsonAddress = MichelsonAddress.from(accountWithTokenID.items[0].get())
            const tokenID: MichelsonInt = MichelsonInt.from(accountWithTokenID.items[1].get())

            const amount: MichelsonInt = MichelsonInt.from(pair.items[1].get())

            return {
              address: account.address instanceof MichelsonString ? account.address.value : TezosUtils.parseAddress(account.address.value),
              tokenID: tokenID.value.toNumber(),
              amount: amount.value.toFixed()
            }
          } catch (error) {
            console.warn(error)

            return undefined
          }
        })
        .filter((balanceOfResults: TezosFA2BalanceOfResponse | undefined) => balanceOfResults !== undefined) as TezosFA2BalanceOfResponse[]
    } else {
      return []
    }
  }

  public async transfer(transferRequests: TezosFA2TransferRequest[], fee: string, publicKey: string): Promise<RawTezosTransaction> {
    const transferCall: TezosContractCall = await this.contract.createContractCall(
      TezosFA2ContractEntrypoint.TRANSFER,
      transferRequests.map((request: TezosFA2TransferRequest) => {
        return {
          from_: request.from,
          txs: request.txs.map((tx) => {
            return {
              to_: tx.to,
              token_id: tx.tokenID,
              amount: tx.amount
            }
          })
        }
      })
    )

    return this.prepareContractCall([transferCall], fee, publicKey)
  }

  public async updateOperators(
    updateRequests: TezosFA2UpdateOperatorRequest[],
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const updateCall: TezosContractCall = await this.contract.createContractCall(
      TezosFA2ContractEntrypoint.UPDATE_OPERATORS,
      updateRequests.map((request: TezosFA2UpdateOperatorRequest) => {
        const args = {
          [`${request.operation}_operator`]: {
            owner: request.owner,
            operator: request.operator,
            token_id: request.tokenId
          }
        }

        return [request.operation === 'add' ? 'Left' : 'Right', args]
      })
    )

    return this.prepareContractCall([updateCall], fee, publicKey)
  }

  public async getTokenMetadata(tokenID?: number): Promise<TezosFATokenMetadata | undefined> {
    return this.getTokenMetadataForTokenID(tokenID ?? this.defaultTokenID)
  }

  private static readonly extractAddressRegex = /^Pair (0x[0-9a-fA-F]+) [\d]+$/

  public async fetchTokenHolders(): Promise<{ address: string; amount: string }[]> {
    const tokenID = (this.options.config as TezosFA2ProtocolConfig).defaultTokenID ?? 0
    const values = await this.contract.conseilBigMapValues({
      bigMapFilter: [
        {
          field: 'key_type',
          operation: 'eq',
          set: ['(pair (address %owner) (nat %token_id))']
        },
        {
          field: 'value_type',
          operation: 'eq',
          set: ['nat']
        }
      ],
      bigMapID: (this.options.config as TezosFA2ProtocolConfig).ledgerBigMapID,
      predicates: [
        {
          field: 'key',
          operation: 'endsWith',
          set: [`${tokenID}`],
          inverse: false
        },
        {
          field: 'value',
          operation: 'isnull',
          set: [],
          inverse: true
        }
      ]
    })
    return values
      .map((value) => {
        try {
          let address: string | undefined = undefined
          const match = TezosFA2Protocol.extractAddressRegex.exec(value.key)
          if (match) {
            address = TezosUtils.parseAddress(match[1])
          }
          if (address === undefined || !value.value) {
            return {
              address: '',
              amount: '0'
            }
          }
          return {
            address,
            amount: value.value
          }
        } catch {
          return {
            address: '',
            amount: '0'
          }
        }
      })
      .filter((value) => value.amount !== '0')
  }

  public async getTotalSupply(): Promise<string> {
    const tokenID = (this.options.config as TezosFA2ProtocolConfig).defaultTokenID ?? 0
    const values = await this.contract.conseilBigMapValues({
      bigMapFilter: [
        {
          field: 'key_type',
          operation: 'eq',
          set: ['nat']
        },
        {
          field: 'value_type',
          operation: 'eq',
          set: ['nat']
        }
      ],
      bigMapID: (this.options.config as TezosFA2ProtocolConfig).totalSupplyBigMapID,
      predicates: [
        {
          field: 'key',
          operation: 'eq',
          set: [`${tokenID}`],
          inverse: false
        }
      ]
    })
    if (values.length === 0 || values[0].value === null || values[0].value === undefined) {
      return '0'
    }
    return values[0].value
  }

  protected getAdditionalTransactionQueryPredicates(_address: string, _addressQueryType: 'string' | 'bytes'): ConseilPredicate[] {
    return [
      {
        field: 'parameters',
        operation: 'like',
        set: [`{ ${this.defaultTokenID} }`],
        inverse: false
      }
    ]
  }

  private async createTransferCall(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex?: number; tokenID?: number }
  ): Promise<TezosContractCall> {
    if (recipients.length !== values.length) {
      throw new ConditionViolationError(Domain.TEZOSFA, 'length of recipients and values does not match!')
    }

    const addressIndex: number = data?.addressIndex ?? 0
    const tokenID: number = data?.tokenID ?? this.defaultTokenID ?? 0
    const addresses: string[] = (await this.getAddressesFromPublicKey(publicKey)).map((address: TezosAddress) => address.getValue())

    if (!addresses[addressIndex]) {
      throw new NotFoundError(Domain.TEZOSFA, `no kt-address with index ${addressIndex} exists`)
    }

    const fromAddress: string = addresses[addressIndex]
    const recipientsWithValues: [string, string][] = recipients.map((recipient: string, index: number) => [recipient, values[index]])

    const transferCall: TezosContractCall = await this.contract.createContractCall(TezosFA2ContractEntrypoint.TRANSFER, [
      {
        from_: fromAddress,
        txs: recipientsWithValues.map(([recipient, value]: [string, string]) => {
          return {
            to_: recipient,
            token_id: tokenID,
            amount: value
          }
        })
      }
    ])

    return transferCall
  }

  protected callbackContract(entrypoint: TezosFA2ContractEntrypoint): string {
    const networkCallbacks: Partial<Record<TezosFA2ContractEntrypoint, string>> | undefined =
      this.defaultCallbackContract[this.options.network.extras.network]
    const callback: string | undefined = networkCallbacks ? networkCallbacks[entrypoint] : undefined

    return callback ?? ''
  }

  private isTransferRequest(obj: unknown): obj is {
    from_: string
    txs: { to_: string; token_id: BigNumber; amount: BigNumber }[]
  } {
    const anyObj = obj as any

    return (
      anyObj instanceof Object &&
      typeof anyObj.from_ === 'string' &&
      Array.isArray(anyObj.txs) &&
      anyObj.txs.every(
        (tx: any) =>
          tx instanceof Object && typeof tx.to_ === 'string' && BigNumber.isBigNumber(tx.token_id) && BigNumber.isBigNumber(tx.amount)
      )
    )
  }
}
