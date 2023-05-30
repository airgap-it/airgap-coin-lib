import { OptimismModule } from './module/OptimismModule'
import { createERC20Token, ERC20Token } from './protocol/erc20/ERC20Token'
import { createOptimismProtocol, OptimismProtocol } from './protocol/OptimismProtocol'
import { OptimismCryptoConfiguration } from './types/crypto'
import { OptimismProtocolNetwork, OptimismProtocolOptions } from './types/protocol'
import {
  OptimismRawUnsignedTransaction,
  OptimismSignedTransaction,
  OptimismTransactionCursor,
  OptimismTypedUnsignedTransaction,
  OptimismUnsignedTransaction
} from './types/transaction'
import { isAnyOptimismProtocol, isOptimismERC20Token, isOptimismProtocol } from './utils/protocol'

// Module

export { OptimismModule }

// Protocol

export { OptimismProtocol, createOptimismProtocol, ERC20Token, createERC20Token }

// Types

export {
  OptimismCryptoConfiguration,
  OptimismProtocolNetwork,
  OptimismProtocolOptions,
  OptimismRawUnsignedTransaction,
  OptimismTypedUnsignedTransaction,
  OptimismUnsignedTransaction,
  OptimismSignedTransaction,
  OptimismTransactionCursor
}

// Utils

export { isAnyOptimismProtocol, isOptimismProtocol, isOptimismERC20Token }
