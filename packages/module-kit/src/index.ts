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
import {
  MultiAddressExtendedPublicKeyProtocol,
  MultiAddressNonExtendedPublicKeyProtocol,
  MultiAddressPublicKeyExtension
} from './protocol/extensions/address/MultiAddressPublicKeyExtension'
import { Bip32OverridingExtension, OfflineBip32Protocol, OnlineBip32Protocol } from './protocol/extensions/bip/Bip32OverridingExtension'
import { AESExtension } from './protocol/extensions/crypto/AESExtension'
import { AsymmetricEncryptionExtension } from './protocol/extensions/crypto/AsymmetricEncryptionExtension'
import { CryptoExtension } from './protocol/extensions/crypto/CryptoExtension'
import { SignMessageExtension } from './protocol/extensions/crypto/SignMessageExtension'
import { ContractSubProtocol, ContractSubProtocolExtension } from './protocol/extensions/sub-protocol/ContractSubProtocolExtension'
import { SubProtocol, SubProtocolExtension } from './protocol/extensions/sub-protocol/SubProtocolExtension'
import { TransactionStatusCheckerExtension } from './protocol/extensions/transaction/TransactionStatusCheckerExtension'
import { AirGapAnyProtocol, AirGapOfflineProtocol, AirGapOnlineProtocol, AirGapProtocol } from './protocol/protocol'
import { Address, AddressCursor, AddressWithCursor } from './types/address'
import { AirGapInterface } from './types/airgap'
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
import { normalizeToUndefined } from './utils/normalize'
import {
  canEncryptAES,
  canEncryptAsymmetric,
  canFetchDataForMultipleAddresses,
  canSignMessage,
  hasConfigurableContract,
  hasConfigurableTransactionInjector,
  hasMultiAddressPublicKeys,
  isBip32Protocol,
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

export { AirGapModule, ModuleNetworkRegistry }

// Protocol

export {
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapAnyProtocol,
  FetchDataForMultipleAddressesExtension,
  FetchDataForMultipleAddressesProtocol,
  MultiAddressPublicKeyExtension,
  MultiAddressNonExtendedPublicKeyProtocol,
  MultiAddressExtendedPublicKeyProtocol,
  Bip32OverridingExtension,
  OfflineBip32Protocol,
  OnlineBip32Protocol,
  SubProtocolExtension,
  SubProtocol,
  ContractSubProtocolExtension,
  ContractSubProtocol,
  CryptoExtension,
  AESExtension as AESEncryptionExtension,
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
  isBip32Protocol,
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
