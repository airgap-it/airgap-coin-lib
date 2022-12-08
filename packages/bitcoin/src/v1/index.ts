import { BlockCypherBlockExplorer } from './block-explorer/BlockCypherBlockExplorer'
import { BitcoinModule } from './module/BitcoinModule'
import { BitcoinSegwitModule } from './module/BitcoinSegwitModule'
import { BitcoinProtocol, createBitcoinProtocol, createBitcoinProtocolOptions } from './protocol/BitcoinProtocol'
import { BitcoinSegwitProtocol, createBitcoinSegwitProtocol } from './protocol/BitcoinSegwitProtocol'
import { BitcoinTestnetProtocol, createBitcoinTestnetProtocol } from './protocol/BitcoinTestnetProtocol'
import { BitcoinProtocolNetwork, BitcoinProtocolOptions, BitcoinUnits } from './types/protocol'
import {
  BitcoinInTransaction,
  BitcoinOutTransaction,
  BitcoinSegwitSignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  BitcoinSignedTransaction,
  BitcoinTransactionCursor,
  BitcoinUnsignedTransaction
} from './types/transaction'

// Module

export { BitcoinModule, BitcoinSegwitModule }

// Protocol

export {
  BitcoinProtocol,
  BitcoinTestnetProtocol,
  BitcoinSegwitProtocol,
  createBitcoinProtocol,
  createBitcoinTestnetProtocol,
  createBitcoinSegwitProtocol,
  createBitcoinProtocolOptions
}

// Block Explorer

export { BlockCypherBlockExplorer }

// Types

export {
  BitcoinUnits,
  BitcoinProtocolNetwork,
  BitcoinProtocolOptions,
  BitcoinUnsignedTransaction,
  BitcoinSignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  BitcoinSegwitSignedTransaction,
  BitcoinInTransaction,
  BitcoinOutTransaction,
  BitcoinTransactionCursor
}