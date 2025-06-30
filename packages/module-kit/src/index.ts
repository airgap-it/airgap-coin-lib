// tslint:disable: max-file-line-count
import { AirGapBlockExplorer } from './block-explorer/block-explorer'
import { newAmount } from './factories/amount'
import { newExtendedPublicKey, newExtendedSecretKey, newPublicKey, newSecretKey } from './factories/key'
import { newSignature } from './factories/signature'
import { newSignedTransaction, newUnsignedTransaction } from './factories/transaction'
import { newErrorUIAlert, newInfoUIAlert, newSuccessUIAlert, newWarningUIAlert } from './factories/ui/alert'
import { newPlainUIText } from './factories/ui/text'
import {
  AirGapSerializedAnyProtocol,
  AirGapSerializedOfflineProtocol,
  AirGapSerializedOnlineProtocol,
  ProtocolSerializerExtension,
  ProtocolSerializerModule
} from './module/extensions/serialization/ProtocolSerializer'
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
import { WalletConnectExtension, WalletConnectProtocol, WalletConnectRequest } from './protocol/extensions/dapp/WalletConnectProtocol'
import { MultisigExtension, MultisigProtocol } from './protocol/extensions/multisig/multisig'
import { GetTokenBalances, GetTokenBalancesExtension, TokenDetails } from './protocol/extensions/sub-protocol/GetTokenBalancesExtension'
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
import {
  CryptoAlgorithm,
  CryptoConfiguration,
  CryptoDerivative,
  CryptoSecretType,
  Ed25519CryptoConfiguration,
  SaplingCryptoConfiguration,
  Secp256K1CryptoConfiguration,
  Sr25519CryptoConfiguration
} from './types/crypto'
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
  ProtocolTransactionArbitraryDataMetadata,
  ProtocolTransactionMetadata,
  ProtocolUnitsMetadata
} from './types/protocol'
import { V3SchemaConfiguration } from './types/serializer'
import { Signature } from './types/signature'
import { SubProtocolType } from './types/sub-protocol'
import {
  AirGapTransaction,
  AirGapTransactionStatus,
  AirGapTransactionsWithCursor,
  SignedTransaction,
  TransactionCursor,
  TransactionDetails,
  TransactionFullConfiguration,
  TransactionSimpleConfiguration,
  TransactionType,
  UnsignedTransaction
} from './types/transaction'
import { AirGapUIAction } from './types/ui/action'
import { AirGapUIAlert } from './types/ui/alert'
import { AirGapUIText } from './types/ui/text'
import { isAmount } from './utils/amount'
import { implementsInterface, Schema } from './utils/interface'
import { isAnyKey, isExtendedPublicKey, isExtendedSecretKey, isPublicKey, isSecretKey } from './utils/key'
import { canSerializeProtocols, createSupportedProtocols, protocolSerializerSchema } from './utils/module'
import { normalizeToUndefined } from './utils/normalize'
import {
  aesEncryptionSchema,
  asymmetricEncryptionBaseSchema,
  asymmetricEncryptionOfflineSchema,
  baseProtocolSchema,
  bip32BaseProtocolSchema,
  bip32OfflineProtocolSchema,
  bip32OnlineProtocolSchema,
  canEncryptAES,
  canEncryptAsymmetric,
  canFetchDataForAddress,
  canFetchDataForMultipleAddresses,
  canGetTokenBalances,
  canSignMessage,
  configurableContractProtocolSchema,
  configurableTransactionInjectorSchema,
  fetchDataForAddressProtocolSchema,
  fetchDataForMultipleAddressesProtocolSchema,
  getTokenBalancesSchema,
  hasConfigurableContract,
  hasConfigurableTransactionInjector,
  hasMultiAddressPublicKeys,
  isAnyProtocol,
  isBip32Protocol,
  isMultisig,
  isMultiTokenSubProtocol,
  isOfflineProtocol,
  isOnlineProtocol,
  isSingleTokenSubProtocol,
  isSubProtocol,
  isTransactionStatusChecker,
  multiAddressPublicKeyProtocolSchema,
  multiTokenSubProtocolBaseSchema,
  offlineProtocolSchema,
  onlineProtocolSchema,
  protocolNetworkIdentifier,
  signMessageBaseSchema,
  signMessageOfflineSchema,
  singleTokenSubProtocolSchema,
  subProtocolSchema,
  supportsWalletConnect,
  transactionStatusCheckerSchema,
  walletConnectProtocolSchema
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
  FullProtocolConfiguration,
  AirGapSerializedOfflineProtocol,
  AirGapSerializedOnlineProtocol,
  AirGapSerializedAnyProtocol
}

// Module Extensions

export { ProtocolSerializerExtension, ProtocolSerializerModule }

// Protocol

export {
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapAnyProtocol,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  ProtocolSymbol,
  ProtocolFeeMetadata,
  ProtocolAccountMetadata,
  ProtocolTransactionMetadata,
  ProtocolTransactionArbitraryDataMetadata,
  ProtocolNetworkType,
  ProtocolNetwork,
  SubProtocolType
}

// Protocol Extensions

export {
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
  TokenDetails,
  GetTokenBalancesExtension,
  GetTokenBalances,
  CryptoExtension,
  AESExtension,
  AsymmetricEncryptionExtension,
  SignMessageExtension,
  TransactionStatusCheckerExtension,
  WalletConnectRequest,
  WalletConnectExtension,
  WalletConnectProtocol,
  MultisigProtocol,
  MultisigExtension
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
  CryptoAlgorithm,
  CryptoSecretType,
  Ed25519CryptoConfiguration,
  Sr25519CryptoConfiguration,
  Secp256K1CryptoConfiguration,
  SaplingCryptoConfiguration,
  CryptoConfiguration,
  CryptoDerivative,
  FeeDefaults,
  FeeEstimation,
  KeyType,
  SecretKey,
  ExtendedSecretKey,
  PublicKey,
  ExtendedPublicKey,
  KeyPair,
  ExtendedKeyPair,
  Signature,
  TransactionType,
  UnsignedTransaction,
  SignedTransaction,
  AirGapTransaction,
  TransactionCursor,
  AirGapTransactionsWithCursor,
  TransactionDetails,
  TransactionSimpleConfiguration,
  TransactionFullConfiguration,
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
  canSerializeProtocols,
  isAnyProtocol,
  isOfflineProtocol,
  isOnlineProtocol,
  isBip32Protocol,
  isSubProtocol,
  isSingleTokenSubProtocol,
  isMultisig,
  isMultiTokenSubProtocol,
  canGetTokenBalances,
  canFetchDataForAddress,
  canFetchDataForMultipleAddresses,
  hasMultiAddressPublicKeys,
  hasConfigurableContract,
  canEncryptAES,
  canEncryptAsymmetric,
  canSignMessage,
  hasConfigurableTransactionInjector,
  isTransactionStatusChecker,
  supportsWalletConnect,
  protocolNetworkIdentifier,
  normalizeToUndefined
}

// Schema

export {
  protocolSerializerSchema,
  baseProtocolSchema,
  offlineProtocolSchema,
  onlineProtocolSchema,
  bip32BaseProtocolSchema,
  bip32OfflineProtocolSchema,
  bip32OnlineProtocolSchema,
  subProtocolSchema,
  singleTokenSubProtocolSchema,
  multiTokenSubProtocolBaseSchema,
  getTokenBalancesSchema,
  fetchDataForAddressProtocolSchema,
  fetchDataForMultipleAddressesProtocolSchema,
  multiAddressPublicKeyProtocolSchema,
  configurableContractProtocolSchema,
  aesEncryptionSchema,
  asymmetricEncryptionBaseSchema,
  asymmetricEncryptionOfflineSchema,
  signMessageBaseSchema,
  signMessageOfflineSchema,
  configurableTransactionInjectorSchema,
  transactionStatusCheckerSchema,
  walletConnectProtocolSchema
}
