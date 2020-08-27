import { CosmosTransactionCursor } from './../protocols/cosmos/CosmosTypes'
import { SubstrateTransactionCursor } from './../protocols/substrate/SubstrateTypes'
import { TezosTransactionCursor } from './../protocols/tezos/types/TezosTransactionCursor'
import { BitcoinTransactionCursor, BitcoinBlockbookTransactionCursor } from './../protocols/bitcoin/BitcoinTypes'
import { ProtocolNetwork } from '../utils/ProtocolNetwork'
import { ProtocolSymbols } from '../utils/ProtocolSymbols'
import { EthereumTransactionCursor } from '../protocols/ethereum/EthereumTypes'
import { AeternityTransactionCursor } from '../protocols/aeternity/AeternityTypes'

export enum AirGapTransactionType {
  SPEND = 'Spend Transaction',
  DELEGATE = 'Delegation',
  UNDELEGATE = 'Undelegate'
}

export enum AirGapTransactionStatus {
  APPLIED = 'applied',
  FAILED = 'failed'
}

export interface IAirGapTransaction {
  from: string[]
  to: string[]
  isInbound: boolean
  amount: string
  fee: string
  timestamp?: number

  protocolIdentifier: ProtocolSymbols

  network: ProtocolNetwork

  hash?: string
  blockHeight?: string
  data?: string

  extra?: any
  status?: AirGapTransactionStatus

  transactionDetails?: any
}

export type IProtocolTransactionCursor =
  | EthereumTransactionCursor
  | BitcoinTransactionCursor
  | TezosTransactionCursor
  | AeternityTransactionCursor
  | SubstrateTransactionCursor
  | CosmosTransactionCursor
  | BitcoinBlockbookTransactionCursor

export interface IAirGapTransactionResult {
  transactions: IAirGapTransaction[]
  cursor: IProtocolTransactionCursor
}
