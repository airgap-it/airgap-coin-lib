import { IAirGapTransaction } from '../../../interfaces/IAirGapTransaction'
import { RawTezosTransaction } from '../../../serializer/types'
import { TezosContractCall } from '../contract/TezosContractCall'
import { TezosNetwork } from '../TezosProtocol'
import { TezosTransactionParameters } from '../types/operations/Transaction'

import { TezosFAProtocol, TezosFAProtocolConfiguration } from './TezosFAProtocol'

enum ContractEntrypointName {
  BALANCE = 'balance_of',
  TRANSFER = 'transfer'
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
}