import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { isHex } from '../../../utils/hex'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { BigMapResponse } from '../types/fa/BigMapResult'
import { TezosFA2BalanceOfRequest } from '../types/fa/TezosFA2BalanceOfRequest'
import { TezosFA2BalanceOfResponse } from '../types/fa/TezosFA2BalanceOfResponse'
import { TezosFA2TokenMetadata } from '../types/fa/TezosFA2TokenMetadata'
import { TezosFA2TransferRequest } from '../types/fa/TezosFA2TransferRequest'
import { TezosFA2UpdateOperatorRequest } from '../types/fa/TezosFA2UpdateOperatorRequest'
import { MichelineDataNode } from '../types/micheline/MichelineNode'
import { MichelsonPair } from '../types/michelson/generics/MichelsonPair'
import { MichelsonAddress } from '../types/michelson/primitives/MichelsonAddress'
import { MichelsonInt } from '../types/michelson/primitives/MichelsonInt'
import { MichelsonString } from '../types/michelson/primitives/MichelsonString'
import { TezosTransactionParameters } from '../types/operations/Transaction'
import { TezosOperationType } from '../types/TezosOperationType'
import { isMichelinePrimitive, isMichelineSequence } from '../types/utils'

import { TezosFAProtocol } from './TezosFAProtocol'
import { TezosFA2ProtocolOptions } from './TezosFAProtocolOptions'
import { MichelsonList } from '../types/michelson/generics/MichelsonList'

enum TezosFA2ContractEntrypoint {
  BALANCE = 'balance_of',
  TRANSFER = 'transfer',
  UPDATE_OPERATORS = 'update_operators',
  TOKEN_METADATA_REGISTRY = 'token_metadata_registry',
  TOKEN_METADATA = 'token_metadata'
}

export class TezosFA2Protocol extends TezosFAProtocol {
  private static DEFAULT_TOKEN_METADATA_BIG_MAP_NAME = 'token_metadata'
  private static DEFAULT_TOKEN_METADATA_BIG_MAP_VALUE_REGEX = /Pair\s\(Pair\s(?<tokenID>\d+)\s\(Pair\s\"(?<symbol>\w*)\"\s\(Pair\s\"(?<name>\w*)\"\s\(Pair\s(?<decimals>\d*)\s\{(?<extras>.*)\}\)\)\)\)/ // temporary until we get Micheline JSON from the API

  public readonly tokenID?: number

  public readonly tokenMetadataBigMapID?: number
  public readonly tokenMetadataBigMapName: string
  public readonly tokenMedatadaBigMapValueRegex: RegExp

  private readonly defaultCallbackContract: Partial<Record<TezosNetwork, Partial<Record<TezosFA2ContractEntrypoint, string>>>>

  constructor(options: TezosFA2ProtocolOptions) {
    super(options)

    this.tokenID = options.config.tokenID

    this.tokenMetadataBigMapID = options.config.tokenMetadataBigMapID
    this.tokenMetadataBigMapName = options.config.tokenMetadataBigMapName ?? TezosFA2Protocol.DEFAULT_TOKEN_METADATA_BIG_MAP_NAME
    this.tokenMedatadaBigMapValueRegex = options.config.tokenMetadataBigMapRegex ?? TezosFA2Protocol.DEFAULT_TOKEN_METADATA_BIG_MAP_VALUE_REGEX

    this.defaultCallbackContract = {
      [TezosNetwork.MAINNET]: {
        [TezosFA2ContractEntrypoint.BALANCE]: 'KT1LyHDYnML5eCuTEVCTynUpivwG6ns6khiG',
        [TezosFA2ContractEntrypoint.TOKEN_METADATA_REGISTRY]: 'KT1L16VBmW8tkovhLmonhfvf6dtTZya6k6af'
      },
      [TezosNetwork.DELPHINET]: {
        [TezosFA2ContractEntrypoint.BALANCE]: 'KT1LQRsAjvUmP4PQi5WXGFyGWPWwbevCLuiw',
        [TezosFA2ContractEntrypoint.TOKEN_METADATA_REGISTRY]: 'KT1VnbvGMNg21xGDqJtW2UkzHyyAB21GV4oy'
      },
      [TezosNetwork.EDONET]: {
        [TezosFA2ContractEntrypoint.BALANCE]: 'KT1UEyZsmSga2KcNkpGbWX6nvGAVHtBpT5is',
        [TezosFA2ContractEntrypoint.TOKEN_METADATA_REGISTRY]: 'KT1MMhwbCMfwzDUu4ur3SEpaf6njn2nsMDBt'
      }
    }
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const tokenID: number | undefined = this.tokenID
    if (tokenID === undefined) {
      throw new Error("Can't check the balance, no tokenID has been provided.")
    }

    const results: TezosFA2BalanceOfResponse[] = await this.balanceOf(addresses.map((address: string) => {
      return {
        address,
        tokenID
      }
    }, this.defaultSourceAddress))

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
      throw new Error('length of recipients and values does not match!')
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
      const callArgumentsList = MichelsonList.from(
        parameters.value,
        (pairJSON: string) => MichelsonPair.from(
          pairJSON,
          undefined,
          (fromJSON: string) => MichelsonAddress.from(fromJSON, 'from_'),
          (txsJSON: string) => MichelsonList.from(
            txsJSON,
            (pairJSON: string) => MichelsonPair.from(
              pairJSON,
              undefined,
              (toJSON: string) => MichelsonAddress.from(toJSON, 'to_'),
              (pairJSON: string) => MichelsonPair.from(
                pairJSON,
                undefined,
                (tokenJSON: string) => MichelsonInt.from(tokenJSON, 'token_id'),
                (amountJSON: string) => MichelsonInt.from(amountJSON, 'amount')
              )
            ),
            'txs'
          ),
        )
      ).asRawValue()

      return Array.isArray(callArgumentsList)
        ? callArgumentsList.map((callArguments: unknown) => {
          if (!this.isTransferRequest(callArguments)) {
            return []
          }

          const from: string = isHex(callArguments.from_) ? TezosUtils.parseAddress(callArguments.from_) : callArguments.from_

          const transferDetails: [string, BigNumber, BigNumber][] = callArguments.txs.map((tx) => {
            const to: string = isHex(tx.to_) ? TezosUtils.parseAddress(tx.to_) : tx.to_

            return [to, tx.token_id, tx.amount] as [string, BigNumber, BigNumber]
          })

          return transferDetails.map(([to, tokenID, amount]: [string, BigNumber, BigNumber]) => {
            return {
              ...defaultDetails,
              amount: amount.toFixed(),
              from: [from],
              to: [to],
              extra: {
                type: parameters.entrypoint,
                assetID: (this.tokenID === undefined || !tokenID.eq(this.tokenID)) ? tokenID.toString() : undefined
              }
            }
          })
        }).reduce((flatten: Partial<IAirGapTransaction>[], next: Partial<IAirGapTransaction>[]) => flatten.concat(next), [])
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
    const balanceOfCall: TezosContractCall = await this.contract.createContractCall(
      TezosFA2ContractEntrypoint.BALANCE,
      {
        requests: balanceRequests.map((request: TezosFA2BalanceOfRequest) => {
          return {
            owner: request.address,
            token_id: request.tokenID
          }
        }),
        callback: callbackContract
      }
    )

    const results: MichelineDataNode = await this.runContractCall(balanceOfCall, this.requireSource(source))
    if (isMichelineSequence(results)) {
      return results.map((node: MichelineDataNode) => {
        try {
          const pair: MichelsonPair = MichelsonPair.from(node, undefined, (value: unknown) => MichelsonPair.from(value, undefined, MichelsonAddress.from, MichelsonInt.from), MichelsonInt.from)

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
      }).filter((balanceOfResults: TezosFA2BalanceOfResponse | undefined) => balanceOfResults !== undefined) as TezosFA2BalanceOfResponse[]
    } else {
      return []
    }
  }

  public async transfer(
    transferRequests: TezosFA2TransferRequest[],
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
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

  public async tokenMetadataRegistry(
    source?: string,
    callbackContract: string = this.callbackContract(TezosFA2ContractEntrypoint.TOKEN_METADATA_REGISTRY)
  ): Promise<string> {
    const tokenMetadataRegistryCall: TezosContractCall = await this.contract.createContractCall(
      TezosFA2ContractEntrypoint.TOKEN_METADATA_REGISTRY,
      callbackContract
    )

    const result: MichelineDataNode = await this.runContractCall(tokenMetadataRegistryCall, this.requireSource(source)).catch(() => [])

    if (isMichelinePrimitive('string', result)) {
      return result.string
    } else if (isMichelinePrimitive('bytes', result)) {
      return TezosUtils.parseAddress(result.bytes)
    } else {
      return ''
    }
  }

  public async tokenMetadata(
    tokenIDs: number[],
    handler: string,
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const tokenMetadataCall: TezosContractCall = await this.contract.createContractCall(
      TezosFA2ContractEntrypoint.TOKEN_METADATA,
      {
        token_ids: tokenIDs,
        handler
      }
    )

    return this.prepareContractCall([tokenMetadataCall], fee, publicKey)
  }

  public async getTokenMetadata(tokenIDs?: number[]): Promise<TezosFA2TokenMetadata[]> {
    const metadataResponse: BigMapResponse[] = await this.contract.bigMapValues({
      bigMapID: this.tokenMetadataBigMapID, // temporarily until we cannot search by a big map's annotation
      predicates: tokenIDs
        ? [
          {
            field: 'key',
            operation: 'in',
            set: tokenIDs
          }
        ]
        : undefined
    })

    return metadataResponse
      .map((response: BigMapResponse) => {
        const match = response.value ? this.tokenMedatadaBigMapValueRegex.exec(response.value) : null

        return match && this.isTokenMetadata(match.groups)
          ? {
            tokenID: new BigNumber(match.groups.tokenID).toNumber(),
            symbol: match.groups.symbol,
            name: match.groups.name,
            decimals: new BigNumber(match.groups.decimals).toNumber(),
            extras: match.groups.extras
          }
          : null
      })
      .filter((metadata: TezosFA2TokenMetadata | null) => metadata !== null) as TezosFA2TokenMetadata[]
  }

  public async fetchTokenHolders(tokenIDs: number[]): Promise<{ address: string; amount: string, tokenID: number }[]> {
    // there is no standard way to fetch token holders for now, every subclass needs to implement its own logic
    return []
  }

  private async createTransferCall(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number, tokenID: number }
  ): Promise<TezosContractCall> {
    if (recipients.length !== values.length) {
      throw new Error('length of recipients and values does not match!')
    }

    const addressIndex: number = data && data.addressIndex !== undefined ? data.addressIndex : 0
    const tokenID: number = data && data.tokenID !== undefined ? data.tokenID : 0
    const addresses: string[] = await this.getAddressesFromPublicKey(publicKey)

    if (!addresses[addressIndex]) {
      throw new Error('no kt-address with this index exists')
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
    const networkCallbacks: Partial<Record<TezosFA2ContractEntrypoint, string>> | undefined = this.defaultCallbackContract[
      this.options.network.extras.network
    ]
    const callback: string | undefined = networkCallbacks ? networkCallbacks[entrypoint] : undefined

    return callback ?? ''
  }

  private isTransferRequest(obj: unknown): obj is {
    from_: string, txs: { to_: string, token_id: BigNumber, amount: BigNumber }[]
  } {
    const anyObj = obj as any

    return (
      anyObj instanceof Object &&
      typeof anyObj.from_ === 'string' &&
      Array.isArray(anyObj.txs) &&
      anyObj.txs.every((tx: any) =>
        tx instanceof Object && typeof tx.to_ === 'string' && BigNumber.isBigNumber(tx.token_id) && BigNumber.isBigNumber(tx.amount)
      )
    )
  }

  private isTokenMetadata(obj: unknown): obj is TezosFA2TokenMetadata {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'tokenID' in obj &&
      'symbol' in obj &&
      'name' in obj &&
      'decimals' in obj
    )
  }
}