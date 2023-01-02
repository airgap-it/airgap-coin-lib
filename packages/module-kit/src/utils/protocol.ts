import createHash = require('@airgap/coinlib-core/dependencies/src/create-hash-1.2.0/index')

import { FetchDataForAddressExtension, FetchDataForAddressProtocol } from '../protocol/extensions/address/FetchDataForAddressExtension'
import {
  FetchDataForMultipleAddressesExtension,
  FetchDataForMultipleAddressesProtocol
} from '../protocol/extensions/address/FetchDataForMultipleAddressesExtension'
import {
  MultiAddressExtendedPublicKeyProtocol,
  MultiAddressNonExtendedPublicKeyProtocol,
  MultiAddressPublicKeyExtension
} from '../protocol/extensions/address/MultiAddressPublicKeyExtension'
import {
  BaseBip32Protocol,
  Bip32OverridingExtension,
  OfflineBip32Protocol,
  OnlineBip32Protocol
} from '../protocol/extensions/bip/Bip32OverridingExtension'
import { ConfigurableContractProtocol } from '../protocol/extensions/contract/ConfigurableContractExtension'
import { AESExtension, AESWithExtendedKeyPair, AESWithNonExtendedKeyPair } from '../protocol/extensions/crypto/AESExtension'
import {
  AsymmetricEncryptionExtension,
  BaseAsymmetricEncryptionWithExtendedKeyPair,
  BaseAsymmetricEncryptionWithNonExtendedKeyPair,
  OfflineAsymmetricEncryptionWithExtendedKeyPair,
  OfflineAsymmetricEncryptionWithNonExtendedKeyPair
} from '../protocol/extensions/crypto/AsymmetricEncryptionExtension'
import {
  BaseSignMessageWithExtendedKeyPair,
  BaseSignMessageWithNonExtendedKeyPair,
  OfflineSignMessageWithExtendedKeyPair,
  OfflineSignMessageWithNonExtendedKeyPair,
  SignMessageExtension
} from '../protocol/extensions/crypto/SignMessageExtension'
import { ContractSubProtocol } from '../protocol/extensions/sub-protocol/ContractSubProtocolExtension'
import { SubProtocol } from '../protocol/extensions/sub-protocol/SubProtocolExtension'
import { ConfigurableTransactionInjectorProtocol } from '../protocol/extensions/transaction/ConfigurableTransactionInjectorExtension'
import {
  TransactionStatusChecker,
  TransactionStatusCheckerExtension
} from '../protocol/extensions/transaction/TransactionStatusCheckerExtension'
import { AnyProtocol, BaseProtocol, OfflineProtocol, OnlineProtocol } from '../protocol/protocol'
import { ProtocolNetwork } from '../types/protocol'

import { implementsInterface, Schema } from './interface'

// Schemas

const baseProtocolSchema: Schema<BaseProtocol> = {
  getAddressFromPublicKey: 'required',
  getDetailsFromTransaction: 'required',
  getMetadata: 'required'
}

const offlineProtocolSchema: Schema<OfflineProtocol> = {
  ...baseProtocolSchema,
  getKeyPairFromSecret: 'required',
  signTransactionWithSecretKey: 'required'
}

const onlineProtocolSchema: Schema<OnlineProtocol> = {
  ...baseProtocolSchema,
  broadcastTransaction: 'required',
  getBalanceOfPublicKey: 'required',
  getNetwork: 'required',
  getTransactionFeeWithPublicKey: 'required',
  getTransactionMaxAmountWithPublicKey: 'required',
  getTransactionsForPublicKey: 'required',
  prepareTransactionWithPublicKey: 'required'
}

const bip32BaseProtocolSchema: Schema<BaseBip32Protocol> = {
  ...baseProtocolSchema,
  deriveFromExtendedPublicKey: 'required'
}

const bip32OfflineProtocolSchema: Schema<OfflineBip32Protocol> = {
  ...bip32BaseProtocolSchema,
  ...offlineProtocolSchema,
  getExtendedKeyPairFromSecret: 'required'
}

const bip32OnlineProtocolSchema: Schema<OnlineBip32Protocol> = {
  ...bip32BaseProtocolSchema,
  ...onlineProtocolSchema
}

const subProtocolSchema: Schema<SubProtocol> = {
  getType: 'required'
}

const contractSubProtocolSchema: Schema<ContractSubProtocol> = {
  ...subProtocolSchema,
  getContractAddress: 'required'
}

const fetchDataForAddressProtocolSchema: Schema<FetchDataForAddressProtocol> = {
  getBalanceOfAddress: 'required',
  getTransactionsForAddress: 'required'
}

const fetchDataForMultipleAddressesProtocolSchema: Schema<FetchDataForMultipleAddressesProtocol> = {
  getBalanceOfAddresses: 'required',
  getTransactionsForAddresses: 'required'
}

const multiAddressPublicKeyProtocolSchema: Schema<MultiAddressNonExtendedPublicKeyProtocol & MultiAddressExtendedPublicKeyProtocol> = {
  getNextAddressFromPublicKey: 'required'
}

const configurableContractProtocolSchema: Schema<ConfigurableContractProtocol> = {
  isContractValid: 'required',
  getContractAddress: 'required',
  setContractAddress: 'required'
}

const aesEncryptionSchema: Schema<AESWithNonExtendedKeyPair & AESWithExtendedKeyPair> = {
  decryptAESWithSecretKey: 'required',
  encryptAESWithSecretKey: 'required'
}

const asymmetricEncryptionBaseSchema: Schema<
  BaseAsymmetricEncryptionWithNonExtendedKeyPair | BaseAsymmetricEncryptionWithExtendedKeyPair
> = {
  encryptAsymmetricWithPublicKey: 'required'
}

const asymmetricEncryptionOfflineSchema: Schema<
  OfflineAsymmetricEncryptionWithNonExtendedKeyPair | OfflineAsymmetricEncryptionWithExtendedKeyPair
> = {
  ...asymmetricEncryptionBaseSchema,
  decryptAsymmetricWithKeyPair: 'required'
}

const signMessageBaseSchema: Schema<BaseSignMessageWithNonExtendedKeyPair | BaseSignMessageWithExtendedKeyPair> = {
  verifyMessageWithPublicKey: 'required'
}

const signMessageOfflineSchema: Schema<OfflineSignMessageWithNonExtendedKeyPair | OfflineSignMessageWithExtendedKeyPair> = {
  ...signMessageBaseSchema,
  signMessageWithKeyPair: 'required'
}

const configurableTransactionInjectorSchema: Schema<ConfigurableTransactionInjectorProtocol> = {
  getInjectorUrl: 'required',
  setInjectorUrl: 'required'
}

const transactionStatusCheckerSchema: Schema<TransactionStatusChecker> = {
  getTransactionStatus: 'required'
}

// Implementation Checks

function isOfflineProtocol(object: unknown): object is OfflineProtocol {
  return implementsInterface<OfflineProtocol>(object, offlineProtocolSchema)
}

function isOnlineProtocol(object: unknown): object is OnlineProtocol {
  return implementsInterface<OnlineProtocol>(object, onlineProtocolSchema)
}

function isOfflineBip32Protocol(protocol: OfflineProtocol): protocol is OfflineProtocol & OfflineBip32Protocol {
  return implementsInterface<OfflineBip32Protocol>(protocol, bip32OfflineProtocolSchema)
}

function isOnlineBip32Protocol(protocol: OnlineProtocol): protocol is OnlineProtocol & OnlineBip32Protocol {
  return implementsInterface<OnlineBip32Protocol>(protocol, bip32OnlineProtocolSchema)
}

export function isBip32Protocol<T extends AnyProtocol>(protocol: T): protocol is T & Bip32OverridingExtension<T> {
  let extendedWithBip32: boolean = false

  if (isOfflineProtocol(protocol)) {
    extendedWithBip32 = isOfflineBip32Protocol(protocol)
  }

  if (isOnlineProtocol(protocol)) {
    extendedWithBip32 &&= isOnlineBip32Protocol(protocol)
  }

  return extendedWithBip32
}

export function isSubProtocol<T extends AnyProtocol>(protocol: T): protocol is T & SubProtocol {
  return implementsInterface<SubProtocol>(protocol, subProtocolSchema)
}

export function isContractSubProtocol<T extends AnyProtocol>(protocol: T): protocol is T & ContractSubProtocol {
  return implementsInterface<ContractSubProtocol>(protocol, contractSubProtocolSchema)
}

export function canFetchDataForAddress<T extends OnlineProtocol>(protocol: T): protocol is T & FetchDataForAddressExtension<T> {
  return implementsInterface<FetchDataForAddressProtocol>(protocol, fetchDataForAddressProtocolSchema)
}

export function canFetchDataForMultipleAddresses<T extends OnlineProtocol>(
  protocol: T
): protocol is T & FetchDataForMultipleAddressesExtension<T> {
  return implementsInterface<FetchDataForMultipleAddressesProtocol>(protocol, fetchDataForMultipleAddressesProtocolSchema)
}

export function hasMultiAddressPublicKeys<T extends AnyProtocol>(protocol: T): protocol is T & MultiAddressPublicKeyExtension<T> {
  return implementsInterface<MultiAddressNonExtendedPublicKeyProtocol & MultiAddressExtendedPublicKeyProtocol>(
    protocol,
    multiAddressPublicKeyProtocolSchema
  )
}

export function hasConfigurableContract<T extends AnyProtocol>(protocol: T): protocol is T & ConfigurableContractProtocol {
  return implementsInterface<ConfigurableContractProtocol>(protocol, configurableContractProtocolSchema)
}

export function canEncryptAES<T extends OfflineProtocol>(protocol: T): protocol is T & AESExtension<T> {
  return implementsInterface<AESWithNonExtendedKeyPair & AESWithExtendedKeyPair>(protocol, aesEncryptionSchema)
}

export function canEncryptAsymmetric<T extends AnyProtocol>(protocol: T): protocol is T & AsymmetricEncryptionExtension<T> {
  let extendedWithAsymmetricEncryption: boolean = implementsInterface<
    BaseAsymmetricEncryptionWithNonExtendedKeyPair & BaseAsymmetricEncryptionWithExtendedKeyPair
  >(protocol, asymmetricEncryptionBaseSchema)

  if (isOfflineProtocol(protocol)) {
    extendedWithAsymmetricEncryption &&= implementsInterface<
      OfflineAsymmetricEncryptionWithNonExtendedKeyPair & OfflineAsymmetricEncryptionWithExtendedKeyPair
    >(protocol, asymmetricEncryptionOfflineSchema)
  }

  return extendedWithAsymmetricEncryption
}

export function canSignMessage<T extends AnyProtocol>(protocol: T): protocol is T & SignMessageExtension<T> {
  let extendedWithSignMessage: boolean = implementsInterface<BaseSignMessageWithNonExtendedKeyPair & BaseSignMessageWithExtendedKeyPair>(
    protocol,
    signMessageBaseSchema
  )

  if (isOfflineProtocol(protocol)) {
    extendedWithSignMessage &&= implementsInterface<OfflineSignMessageWithNonExtendedKeyPair & OfflineSignMessageWithExtendedKeyPair>(
      protocol,
      signMessageOfflineSchema
    )
  }

  return extendedWithSignMessage
}

export function hasConfigurableTransactionInjector<T extends OnlineProtocol>(
  protocol: T
): protocol is T & ConfigurableTransactionInjectorProtocol {
  return implementsInterface<ConfigurableTransactionInjectorProtocol>(protocol, configurableTransactionInjectorSchema)
}

export function isTransactionStatusChecker<T extends OnlineProtocol>(protocol: T): protocol is T & TransactionStatusCheckerExtension<T> {
  return implementsInterface<TransactionStatusChecker>(protocol, transactionStatusCheckerSchema)
}

// Identifier

const sha256hashShort: (input: string) => string = (input: string): string => {
  const hash = createHash('sha256')
  hash.update(input)

  return hash.digest('base64').slice(0, 10)
}

export function protocolNetworkIdentifier(network: ProtocolNetwork): string {
  const hashed: string = sha256hashShort(`${network.name}-${network.rpcUrl}`)

  return `${network.type}-${hashed}`
}
