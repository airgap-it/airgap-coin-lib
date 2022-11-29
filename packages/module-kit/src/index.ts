import { AirGapBlockExplorer } from './block-explorer/AirGapBlockExplorer'
import { newAmount } from './factories/amount'
import { newExtendedPublicKey, newExtendedSecretKey, newPublicKey, newSecretKey } from './factories/key'
import { newSignature } from './factories/signature'
import { newSignedTransaction, newUnsignedTransaction } from './factories/transaction'
import { newPlainUIText } from './factories/ui/text'
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
import { BlockExplorerMetadata } from './types/block-explorer'
import { BytesString, BytesStringFormat, HexString } from './types/bytes'
import { FeeDefaults, FeeEstimation } from './types/fee'
import { ExtendedKeyPair, ExtendedPublicKey, ExtendedSecretKey, KeyPair, KeyType, PublicKey, SecretKey } from './types/key'
import { RecursivePartial } from './types/meta/utility-types'
import {
  ProtocolAccountMetadata,
  ProtocolFeeMetadata,
  ProtocolMetadata,
  ProtocolNetwork,
  ProtocolNetworkType,
  ProtocolSymbol,
  ProtocolUnitsMetadata
} from './types/protocol'
import { HexSecret, MnemonicSecret, Secret, SecretType } from './types/secret'
import { Signature } from './types/signature'
import {
  AirGapTransaction,
  AirGapTransactionStatus,
  AirGapTransactionsWithCursor,
  SignedTransaction,
  TransactionConfiguration,
  TransactionCursor,
  TransactionDetails,
  TransactionType,
  UnsignedTransaction
} from './types/transaction'
import { AirGapUIAction } from './types/ui/action'
import { AirGapUIAlert } from './types/ui/alert'
import { AirGapUIText } from './types/ui/text'
import { isAmount } from './utils/amount'
import {
  isAnyExtendedProtocol,
  isExtendedProtocol,
  isOfflineExtendedProtocol,
  isOnlineExtendedProtocol,
  protocolNetworkIdentifier
} from './utils/protocol'

// Block Explorer

export { AirGapBlockExplorer }

// Factories

export {
  newPlainUIText,
  newAmount,
  newSecretKey,
  newExtendedSecretKey,
  newPublicKey,
  newExtendedPublicKey,
  newSignature,
  newUnsignedTransaction,
  newSignedTransaction
}

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
  BlockExplorerMetadata,
  BytesStringFormat,
  BytesString,
  HexString,
  FeeDefaults,
  FeeEstimation,
  KeyType,
  SecretKey,
  ExtendedSecretKey,
  PublicKey,
  ExtendedPublicKey,
  KeyPair,
  ExtendedKeyPair,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
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
  TransactionConfiguration,
  AirGapTransactionStatus,
  RecursivePartial
}

// Utils

export {
  isAmount,
  isOfflineExtendedProtocol,
  isOnlineExtendedProtocol,
  isExtendedProtocol,
  isAnyExtendedProtocol,
  protocolNetworkIdentifier
}
