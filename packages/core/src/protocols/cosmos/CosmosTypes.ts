import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'

export interface CosmosTransactionCursor {
  address: string
  limit: number
  sender: {
    page: number
    totalPages: number
    count: number
    totalCount: number
  }
  receipient: {
    page: number
    totalPages: number
    count: number
    totalCount: number
  }
}

export interface CosmosTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: CosmosTransactionCursor
}

export interface CosmosNodeInfo {
  protocol_version: {
    p2p: string
    block: string
    app: string
  }
  id: string
  listen_addr: string
  network: string
  version: string
  channels: string
  moniker: string
  other: {
    tx_index: string
    rpc_address: string
  }
}

export interface CosmosAccount {
  type: string
  value: CosmosAccountValue
}

export interface CosmosAccountValue {
  account_number: string
  address: string
  coins: CosmosAccountCoin[]
  sequence?: string
  public_key?: string
}

export interface CosmosAccountCoin {
  denom: string
  amount: string
}

export interface CosmosDelegation {
  delegation: {
    delegator_address: string
    validator_address: string
    shares: string
  }
  balance: {
    denom: string
    amount: string
  }
}

export interface CosmosUnbondingDelegation {
  delegator_address: string
  validator_address: string
  entries: {
    creation_height: string
    completion_time: string
    initial_balance: string
    balance: string
  }[]
}

export interface CosmosValidator {
  operator_address: string
  consensus_pubkey: string
  jailed: boolean
  status: number
  tokens: string
  delegator_shares: string
  description: CosmosValidatorDescription
  unbonding_height: string
  unbonding_time: string
  commission: CosmosValidatorCommission
  min_self_delegation: string
}

export interface CosmosValidatorDescription {
  moniker: string
  identity: string
  website: string
  details: string
}

export interface CosmosValidatorCommission {
  commission_rates: CosmosValidatorCommissionRate
  update_time: string
}

export interface CosmosValidatorCommissionRate {
  rate: string
  max_rate: string
  max_change_rate: string
}

export interface TxResponse {
  height: string
  txhash: string
  codespace: string
  code: number
  data: string
  raw_log: string
  logs: any[]
  info: string
  gas_wanted: string
  gas_used: string
  tx?: any
  timestamp: string
}

export interface CosmosBroadcastSignedTransactionResponse {
  tx_response: TxResponse
}

export interface CosmosRewardDetails {
  validator_address: string
  reward: {
    denom: string
    amount: number
  }[]
}

export interface CosmosPagedSendTxsResponse {
  total_count: string
  count: string
  page_number: string
  page_total: string
  limit: string
  txs: CosmosSendTx[]
}

export interface CosmosSendTx {
  height: string
  txhash: string
  gas_wanted: string
  gas_used: string
  tx: {
    type: string
    value: {
      msg: [
        {
          type: string
          value: {
            from_address: string
            to_address: string
            amount: [
              {
                denom: string
                amount: string
              }
            ]
          }
        }
      ]
      fee: {
        amount: [
          {
            denom: string
            amount: string
          }
        ]
        gas: string
      }
      memo: string
    }
  }
  timestamp: string
}
