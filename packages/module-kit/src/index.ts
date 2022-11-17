import { AirGapBlockExplorer } from './block-explorer/AirGapBlockExplorer'
import { extendedPrivateKey, extendedPublicKey, privateKey, publicKey } from './factories/key'
import { signature } from './factories/signature'
import { signedTransaction, unsignedTransaction } from './factories/transaction'
import { AirGapModule } from './module/AirGapModule'
import {
  AirGapAnyExtendedProtocol,
  AirGapExtendedProtocol,
  AirGapOfflineExtendedProtocol,
  AirGapOnlineExtendedProtocol
} from './protocol/AirGapExtendedProtocol'
import { AirGapAnyProtocol, AirGapOfflineProtocol, AirGapOnlineProtocol, AirGapProtocol } from './protocol/AirGapProtocol'
import { Address, AddressCursor, AddressWithCursor } from './types/address'
import { Amount } from './types/amount'
import { Balance } from './types/balance'
import { FeeDefaults, FeeEstimation } from './types/fee'
import { ExtendedKeyPair, ExtendedPrivateKey, ExtendedPublicKey, KeyFormat, KeyPair, KeyType, PrivateKey, PublicKey } from './types/key'
import {
  ProtocolAccountMetadata,
  ProtocolFeeMetadata,
  ProtocolMetadata,
  ProtocolNetwork,
  ProtocolNetworkType,
  ProtocolSymbol,
  ProtocolUnit
} from './types/protocol'
import { HexSecret, MnemonicSecret, Secret, SecretType } from './types/secret'
import { Signature } from './types/signature'
import {
  AirGapTransaction,
  AirGapTransactionStatus,
  AirGapTransactionsWithCursor,
  SignedTransaction,
  TransactionCursor,
  TransactionDetails,
  TransactionType,
  UnsignedTransaction
} from './types/transaction'
import { AirGapUIAction } from './types/ui/action'
import { AirGapUIAlert } from './types/ui/alert'
import { AirGapUIText } from './types/ui/text'
import { isAnyExtendedProtocol, isExtendedProtocol, isOfflineExtendedProtocol, isOnlineExtendedProtocol } from './utils/protocol'

// Block Explorer

export { AirGapBlockExplorer }

// Factories

export { privateKey, extendedPrivateKey, publicKey, extendedPublicKey, signature, unsignedTransaction, signedTransaction }

// Module

export { AirGapModule }

// Protocol

export {
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapAnyProtocol,
  AirGapOfflineExtendedProtocol,
  AirGapOnlineExtendedProtocol,
  AirGapExtendedProtocol,
  AirGapAnyExtendedProtocol
}

// Types

export {
  AirGapUIAction,
  AirGapUIAlert,
  AirGapUIText,
  Address,
  AddressCursor,
  AddressWithCursor,
  Amount,
  Balance,
  FeeDefaults,
  FeeEstimation,
  KeyType,
  KeyFormat,
  PrivateKey,
  ExtendedPrivateKey,
  PublicKey,
  ExtendedPublicKey,
  KeyPair,
  ExtendedKeyPair,
  ProtocolMetadata,
  ProtocolUnit,
  ProtocolSymbol,
  ProtocolFeeMetadata,
  ProtocolAccountMetadata,
  ProtocolNetworkType,
  ProtocolNetwork,
  SecretType,
  MnemonicSecret,
  HexSecret,
  Secret,
  Signature,
  TransactionType,
  UnsignedTransaction,
  SignedTransaction,
  AirGapTransaction,
  TransactionCursor,
  AirGapTransactionsWithCursor,
  TransactionDetails,
  AirGapTransactionStatus
}

// Utils

export { isOfflineExtendedProtocol, isOnlineExtendedProtocol, isExtendedProtocol, isAnyExtendedProtocol }
