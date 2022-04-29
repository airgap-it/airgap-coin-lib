import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { CosmosCoinJSON } from './CosmosCoin'

export interface CosmosTransactionCursor {
  address: string
  limit: number
  sender: {
    total: number
    offset: number
  }
  recipient: {
    total: number
    offset: number
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

export interface Amount {
  denom: string
  amount: string
}

export interface Message {
  '@type': string
  delegator_address: string
  validator_address: string
  from_address: string
  to_address: string
  amount: Amount[]
}

export interface Body {
  messages: Message[]
  memo: string
  timeout_height: string
  extension_options: any[]
  non_critical_extension_options: any[]
}

export interface PublicKey {
  '@type': string
  key: string
}

export interface Single {
  mode: string
}

export interface ModeInfo {
  single: Single
}

export interface SignerInfo {
  public_key: PublicKey
  mode_info: ModeInfo
  sequence: string
}

export interface Amount2 {
  denom: string
  amount: string
}

export interface Fee {
  amount: Amount2[]
  gas_limit: string
  payer: string
  granter: string
}

export interface AuthInfo {
  signer_infos: SignerInfo[]
  fee: Fee
}

export interface Tx {
  body: Body
  auth_info: AuthInfo
  signatures: string[]
}

export interface Attribute {
  key: string
  value: string
}

export interface Event {
  type: string
  attributes: Attribute[]
}

export interface Log {
  msg_index: number
  log: string
  events: Event[]
}

export interface Amount3 {
  denom: string
  amount: string
}

export interface StakingMessage {
  '@type': string
  delegator_address: string
  validator_address: string
  amount?: CosmosCoinJSON
}

export interface SendMessage {
  '@type': string
  from_address: string
  to_address: string
  amount: CosmosCoinJSON[]
}

export interface Body2 {
  messages: any
  memo: string
  timeout_height: string
  extension_options: any[]
  non_critical_extension_options: any[]
}

export interface PublicKey2 {
  '@type': string
  key: string
}

export interface Single2 {
  mode: string
}

export interface ModeInfo2 {
  single: Single2
}

export interface SignerInfo2 {
  public_key: PublicKey2
  mode_info: ModeInfo2
  sequence: string
}

export interface Amount4 {
  denom: string
  amount: string
}

export interface Fee2 {
  amount: Amount4[]
  gas_limit: string
  payer: string
  granter: string
}

export interface AuthInfo2 {
  signer_infos: SignerInfo2[]
  fee: Fee2
}

export interface Tx2 {
  '@type': string
  body: Body2
  auth_info: AuthInfo2
  signatures: string[]
}

export interface Attribute2 {
  key: string
  value: string
  index: boolean
}

export interface Event2 {
  type: string
  attributes: Attribute2[]
}

export interface TxResponse {
  height: string
  txhash: string
  codespace: string
  code: number
  data: string
  raw_log: string
  logs: Log[]
  info: string
  gas_wanted: string
  gas_used: string
  tx: Tx2
  timestamp: Date
  events: Event2[]
}

export interface Pagination {
  next_key?: any
  total: string
}

export interface CosmosPagedSendTxsResponse {
  txs: Tx[]
  tx_responses: TxResponse[]
  pagination: Pagination
}

export const calculateTransactionLimit = (limit, selfTotal, otherTotal, selfOffset, otherOffset) => {
  return Math.min(Math.max(Math.ceil(limit / 2), limit - (otherTotal - otherOffset)), selfTotal - selfOffset)
}
