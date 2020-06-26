import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosNetwork } from '../TezosProtocol'
import { TezosTransactionParameters } from '../types/operations/Transaction'

import { TezosFAProtocol, TezosFAProtocolConfiguration } from './TezosFAProtocol'

enum ContractEntrypointName {
  BALANCE = 'balance_of',
  TRANSFER = 'transfer',
  UPDATE_OPERATORS = 'update_operators',
  TOKEN_METADATA_REGISTRY = 'token_metadata_regitry', // TODO: set proper entrypoint name when the typo is fixed in the test contract
  TOKEN_METADATA = 'token_metadata'
}

export interface TezosFA2BalanceOfRequest {
  address: string
  tokenID: number
}

export interface TezosFA2TransferRequest {
  from: string
  txs: {
    to: string
    tokenID: number
    amount: string
  }[]
}

export interface TezosFA2UpdateOperatorRequest {
  operation: 'add' | 'remove'
  owner: string
  operator: string
}

export class TezosFA2Protocol extends TezosFAProtocol {
  constructor(configuration: TezosFAProtocolConfiguration) {
    super({
      // TODO: set proper addresses
      callbackDefaults: [
        [TezosNetwork.MAINNET, ''],
        [TezosNetwork.CARTHAGENET, '']
      ],
      ...configuration
    })
  }

  public transactionDetailsFromParameters(parameters: TezosTransactionParameters): Promise<Partial<IAirGapTransaction>[]> {
    throw new Error('Method not implemented.')
  }

  public async balanceOf(
    balanceRequests: TezosFA2BalanceOfRequest[],
    source?: string,
    callbackContract: string = this.callbackContract()
  ): Promise<string> {
    const balanceOfCall: TezosContractCall = await this.contract.createContractCall(
      ContractEntrypointName.BALANCE, 
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

    return this.runContractCall(balanceOfCall, this.requireSource(source))
  }

  public async transfer(
    transferRequests: TezosFA2TransferRequest[],
    fee: string,
    publicKey: string
  ): Promise<RawTezosTransaction> {
    const transferCall: TezosContractCall = await this.contract.createContractCall(
      ContractEntrypointName.TRANSFER,
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
      ContractEntrypointName.UPDATE_OPERATORS,
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

  public async tokenMetadataRegistry(source?: string, callbackContract: string = this.callbackContract()): Promise<string> {
    const tokenMetadataRegistryCall: TezosContractCall = await this.contract.createContractCall(
      ContractEntrypointName.TOKEN_METADATA_REGISTRY,
      callbackContract
    )

    return this.runContractCall(tokenMetadataRegistryCall, this.requireSource(source))
  }

  public async tokenMetadata(
    tokenIDs: number[], 
    source?: string, 
    callbackContract: string = this.callbackContract()
  ): Promise<string> {
    const tokenMetadataCall: TezosContractCall = await this.contract.createContractCall(
      ContractEntrypointName.TOKEN_METADATA,
      {
        token_ids: tokenIDs,
        handler: callbackContract
      }
    )

    return this.runContractCall(tokenMetadataCall, this.requireSource(source))
  }
}