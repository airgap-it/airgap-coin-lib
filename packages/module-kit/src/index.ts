import { AirGapBlockExplorer } from './block-explorer/AirGapBlockExplorer'
import { extendedSecretKey, extendedPublicKey, secretKey, publicKey } from './factories/key'
import { signature } from './factories/signature'
import { signedTransaction, unsignedTransaction } from './factories/transaction'
import { plainUIText } from './factories/ui/text'
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
import { BytesString, BytesStringFormat } from './types/bytes'
import { FeeDefaults, FeeEstimation } from './types/fee'
import { ExtendedKeyPair, ExtendedSecretKey, ExtendedPublicKey, KeyPair, KeyType, SecretKey, PublicKey } from './types/key'
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
  TransactionCursor,
  TransactionDetails,
  TransactionType,
  UnsignedTransaction
} from './types/transaction'
import { AirGapUIAction } from './types/ui/action'
import { AirGapUIAlert } from './types/ui/alert'
import { AirGapUIText } from './types/ui/text'
import { amount, isAmount } from './utils/amount'
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

export { plainUIText, secretKey, extendedSecretKey, publicKey, extendedPublicKey, signature, unsignedTransaction, signedTransaction }

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
  BytesStringFormat,
  BytesString,
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
  AirGapTransactionStatus,
  RecursivePartial
}

// Utils

export {
  amount,
  isAmount,
  isOfflineExtendedProtocol,
  isOnlineExtendedProtocol,
  isExtendedProtocol,
  isAnyExtendedProtocol,
  protocolNetworkIdentifier
}
