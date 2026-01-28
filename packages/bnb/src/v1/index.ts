import { BnbModule } from './module/BnbModule'
import { createERC20Token, ERC20Token } from './protocol/erc20/ERC20Token'
import { createBnbProtocol, BnbProtocol } from './protocol/BnbProtocol'
import { BnbCryptoConfiguration } from './types/crypto'
import { BnbProtocolNetwork, BnbProtocolOptions } from './types/protocol'
import {
  BnbRawUnsignedTransaction,
  BnbSignedTransaction,
  BnbTransactionCursor,
  BnbTypedUnsignedTransaction,
  BnbUnsignedTransaction
} from './types/transaction'
import { isAnyBnbProtocol, isBnbERC20Token, isBnbProtocol } from './utils/protocol'

// Module

export { BnbModule }

// Protocol

export { BnbProtocol, createBnbProtocol, ERC20Token, createERC20Token }

// Types

export {
  BnbCryptoConfiguration,
  BnbProtocolNetwork,
  BnbProtocolOptions,
  BnbRawUnsignedTransaction,
  BnbTypedUnsignedTransaction,
  BnbUnsignedTransaction,
  BnbSignedTransaction,
  BnbTransactionCursor
}

// Utils

export { isAnyBnbProtocol, isBnbProtocol, isBnbERC20Token }
