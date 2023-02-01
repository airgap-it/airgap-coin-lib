import { AirGapBlockExplorer } from './block-explorer/block-explorer'
import { newAmount } from './factories/amount'
import { newExtendedPublicKey, newExtendedSecretKey, newPublicKey, newSecretKey } from './factories/key'
import { newSignature } from './factories/signature'
import { newSignedTransaction, newUnsignedTransaction } from './factories/transaction'
import { newErrorUIAlert, newInfoUIAlert, newSuccessUIAlert, newWarningUIAlert } from './factories/ui/alert'
import { newPlainUIText } from './factories/ui/text'
import { AirGapModule } from './module/module'
import { ModuleNetworkRegistry } from './module/module-network-registry'
import {
  FetchDataForMultipleAddressesExtension,
  FetchDataForMultipleAddressesProtocol
} from './protocol/extensions/address/FetchDataForMultipleAddressesExtension'
import { MultiAddressPublicKeyExtension, MultiAddressPublicKeyProtocol } from './protocol/extensions/address/MultiAddressPublicKeyExtension'
import { Bip32Extension, OfflineBip32Protocol, OnlineBip32Protocol } from './protocol/extensions/bip/Bip32Extension'
import { AESExtension } from './protocol/extensions/crypto/AESExtension'
import { AsymmetricEncryptionExtension } from './protocol/extensions/crypto/AsymmetricEncryptionExtension'
import { CryptoExtension } from './protocol/extensions/crypto/CryptoExtension'
import { SignMessageExtension } from './protocol/extensions/crypto/SignMessageExtension'
import {
  BaseMultiTokenSubProtocol,
  MultiTokenBalanceConfiguration,
  MultiTokenSubProtocolExtension,
  OnlineMultiTokenSubProtocol
} from './protocol/extensions/sub-protocol/MultiTokenSubProtocolExtension'
import { SingleTokenSubProtocol, SingleTokenSubProtocolExtension } from './protocol/extensions/sub-protocol/SingleTokenSubProtocolExtension'
import { SubProtocol, SubProtocolExtension } from './protocol/extensions/sub-protocol/SubProtocolExtension'
import { TransactionStatusCheckerExtension } from './protocol/extensions/transaction/TransactionStatusCheckerExtension'
import { AirGapAnyProtocol, AirGapOfflineProtocol, AirGapOnlineProtocol, AirGapProtocol } from './protocol/protocol'
import { AirGapV3SerializerCompanion } from './serializer/serializer'
import { Address, AddressCursor, AddressWithCursor } from './types/address'
import { AirGapInterface } from './types/airgap'
import { Amount } from './types/amount'
import { Balance } from './types/balance'
import { BlockExplorerMetadata } from './types/block-explorer'
import { BytesString, BytesStringFormat, HexString } from './types/bytes'
import { FeeDefaults, FeeEstimation } from './types/fee'
import { ExtendedKeyPair, ExtendedPublicKey, ExtendedSecretKey, KeyPair, KeyType, PublicKey, SecretKey } from './types/key'
import { RecursivePartial } from './types/meta/utility-types'
import { FullProtocolConfiguration, OfflineProtocolConfiguration, OnlineProtocolConfiguration, ProtocolConfiguration } from './types/module'
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
import { V3SchemaConfiguration } from './types/serializer'
import { Signature } from './types/signature'
import { SubProtocolType } from './types/sub-protocol'
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
import { implementsInterface, Schema } from './utils/interface'
import { isAnyKey, isExtendedPublicKey, isExtendedSecretKey, isPublicKey, isSecretKey } from './utils/key'
import { createSupportedProtocols } from './utils/module'
import { normalizeToUndefined } from './utils/normalize'
import {
  canEncryptAES,
  canEncryptAsymmetric,
  canFetchDataForAddress,
  canFetchDataForMultipleAddresses,
  canSignMessage,
  hasConfigurableContract,
  hasConfigurableTransactionInjector,
  hasMultiAddressPublicKeys,
  isBip32Protocol,
  isMultiTokenSubProtocol,
  isOfflineProtocol,
  isOnlineProtocol,
  isSingleTokenSubProtocol,
  isSubProtocol,
  isTransactionStatusChecker,
  protocolNetworkIdentifier
} from './utils/protocol'

// Block Explorer

export { AirGapBlockExplorer, BlockExplorerMetadata }

// Factories

export {
  newSuccessUIAlert,
  newInfoUIAlert,
  newWarningUIAlert,
  newErrorUIAlert,
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

export {
  AirGapModule,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  OfflineProtocolConfiguration,
  OnlineProtocolConfiguration,
  FullProtocolConfiguration
}

// Protocol

export {
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapAnyProtocol,
  FetchDataForMultipleAddressesExtension,
  FetchDataForMultipleAddressesProtocol,
  MultiAddressPublicKeyExtension,
  MultiAddressPublicKeyProtocol,
  Bip32Extension,
  OfflineBip32Protocol,
  OnlineBip32Protocol,
  SubProtocolExtension,
  SubProtocol,
  SingleTokenSubProtocolExtension,
  SingleTokenSubProtocol,
  MultiTokenSubProtocolExtension,
  BaseMultiTokenSubProtocol,
  OnlineMultiTokenSubProtocol,
  CryptoExtension,
  AESExtension,
  AsymmetricEncryptionExtension,
  SignMessageExtension,
  TransactionStatusCheckerExtension,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  ProtocolSymbol,
  ProtocolFeeMetadata,
  ProtocolAccountMetadata,
  ProtocolNetworkType,
  ProtocolNetwork,
  SubProtocolType
}

// Serializer

export { AirGapV3SerializerCompanion, V3SchemaConfiguration }

// AirGap Types

export { AirGapInterface }

// Other Types

export {
  AirGapUIAction,
  AirGapUIAlert,
  AirGapUIText,
  Address,
  AddressCursor,
  AddressWithCursor,
  Amount,
  Balance,
  MultiTokenBalanceConfiguration,
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
  Schema,
  implementsInterface,
  isAnyKey,
  isSecretKey,
  isExtendedSecretKey,
  isPublicKey,
  isExtendedPublicKey,
  createSupportedProtocols,
  isOfflineProtocol,
  isOnlineProtocol,
  isBip32Protocol,
  isSubProtocol,
  isSingleTokenSubProtocol,
  isMultiTokenSubProtocol,
  canFetchDataForAddress,
  canFetchDataForMultipleAddresses,
  hasMultiAddressPublicKeys,
  hasConfigurableContract,
  canEncryptAES,
  canEncryptAsymmetric,
  canSignMessage,
  hasConfigurableTransactionInjector,
  isTransactionStatusChecker,
  protocolNetworkIdentifier,
  normalizeToUndefined
}
