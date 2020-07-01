import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { isHex } from '../../../utils/hex'
import { FeeDefaults } from '../../ICoinProtocol'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosNetwork } from '../TezosProtocol'
import { TezosUtils } from '../TezosUtils'
import { TezosFA2BalanceOfRequest } from '../types/fa/TezosFA2BalanceOfRequest'
import { TezosFA2BalanceOfResponse } from '../types/fa/TezosFA2BalanceOfResponse'
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

import { TezosFAProtocol, TezosFAProtocolConfiguration } from './TezosFAProtocol'

enum FA2ContractEntrypointName {
  BALANCE = 'balance_of',
  TRANSFER = 'transfer',
  UPDATE_OPERATORS = 'update_operators',
  TOKEN_METADATA_REGISTRY = 'token_metadata_regitry', // TODO: set proper entrypoint name when the typo is fixed in the test contract
  TOKEN_METADATA = 'token_metadata'
}

export interface TezosFA2ProtocolConfiguration extends TezosFAProtocolConfiguration {
  tokenID?: number
}

export class TezosFA2Protocol extends TezosFAProtocol {
  public readonly tokenID?: number

  private readonly defaultCallbackContract: Partial<Record<TezosNetwork, Partial<Record<FA2ContractEntrypointName, string>>>>

  constructor(configuration: TezosFA2ProtocolConfiguration) {
    super(configuration)

    this.tokenID = configuration.tokenID

    this.defaultCallbackContract = {
      [TezosNetwork.MAINNET]: {
        [FA2ContractEntrypointName.BALANCE]: '',
        [FA2ContractEntrypointName.TOKEN_METADATA_REGISTRY]: ''
      },
      [TezosNetwork.CARTHAGENET]: {
        [FA2ContractEntrypointName.BALANCE]: 'KT1HZqHf5XKW4aAJc7UZvdYgq4zfZRYb5dAs',
        [FA2ContractEntrypointName.TOKEN_METADATA_REGISTRY]: 'KT1H2uaYTUhrfMC3TcmJXkocv1qhK8fRkVfR'
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

  public async transactionDetailsFromParameters(parameters: TezosTransactionParameters): Promise<Partial<IAirGapTransaction>[]> {
    if (parameters.entrypoint !== FA2ContractEntrypointName.TRANSFER) {
      throw new Error('Only calls to the transfer entrypoint can be converted to IAirGapTransaction')
    }
    
    const contractCall: TezosContractCall = await this.contract.parseContractCall(parameters)

    return contractCall.args().map((callArguments: unknown) => {
      if (!this.isTransferRequest(callArguments)) {
        return {}
      }

      const from: string = isHex(callArguments.from_) ? TezosUtils.parseAddress(callArguments.from_) : callArguments.from_

      const recipientsWithAmount: [string, BigNumber][] = callArguments.txs.map((tx) => {
        const to: string = isHex(tx.to_) ? TezosUtils.parseAddress(tx.to_) : tx.to_

        return [to, tx.amount] as [string, BigNumber]
      })

      const amount: BigNumber = recipientsWithAmount.reduce(
        (sum: BigNumber, [_, next]: [string, BigNumber]) => sum.plus(next),
        new BigNumber(0)
      )
      const to: string[] = recipientsWithAmount.map(([recipient, _]: [string, BigNumber]) => recipient)

      return {
        amount: amount.toFixed(),
        from: [from],
        to
      }
    })
  }

  public async balanceOf(
    balanceRequests: TezosFA2BalanceOfRequest[],
    source?: string,
    callbackContract: string = this.callbackContract(FA2ContractEntrypointName.BALANCE)
  ): Promise<TezosFA2BalanceOfResponse[]> {
    const balanceOfCall: TezosContractCall = await this.contract.createContractCall(
      FA2ContractEntrypointName.BALANCE, 
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
            const pair: MichelsonPair = MichelsonPair.from(node, (value: unknown) => MichelsonPair.from(value, MichelsonAddress.from, MichelsonInt.from), MichelsonInt.from)

            const accountWithTokenID: MichelsonPair = MichelsonPair.from(pair.first.get())
            const account: MichelsonAddress = MichelsonAddress.from(accountWithTokenID.first.get())
            const tokenID: MichelsonInt = MichelsonInt.from(accountWithTokenID.second.get())

            const amount: MichelsonInt = MichelsonInt.from(pair.second.get())

            return {
              address: account.address instanceof MichelsonString ? account.address.value : TezosUtils.parseAddress(account.address.value),
              tokenID: tokenID.value.toNumber(),
              amount: amount.value.toFixed()
            }
          } catch(error) {
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
      FA2ContractEntrypointName.TRANSFER,
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
      FA2ContractEntrypointName.UPDATE_OPERATORS,
      updateRequests.map((request: TezosFA2UpdateOperatorRequest) => {
        return {
          [`${request.operation}_operator`]: {
            owner: request.owner,
            operator: request.operator
          }
        }
      })
    )

    return this.prepareContractCall([updateCall], fee, publicKey)
  }

  public async tokenMetadataRegistry(source?: string, callbackContract: string = this.callbackContract(FA2ContractEntrypointName.TOKEN_METADATA_REGISTRY)): Promise<string> {
    const tokenMetadataRegistryCall: TezosContractCall = await this.contract.createContractCall(
      FA2ContractEntrypointName.TOKEN_METADATA_REGISTRY,
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
      FA2ContractEntrypointName.TOKEN_METADATA,
      {
        token_ids: tokenIDs,
        handler
      }
    )

    return this.prepareContractCall([tokenMetadataCall], fee, publicKey)
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

    const transferCall: TezosContractCall = await this.contract.createContractCall(FA2ContractEntrypointName.TRANSFER, [
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

  protected callbackContract(entrypoint: FA2ContractEntrypointName): string {
    const networkCallbacks: Partial<Record<FA2ContractEntrypointName, string>> | undefined = this.defaultCallbackContract[this.network]
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
}