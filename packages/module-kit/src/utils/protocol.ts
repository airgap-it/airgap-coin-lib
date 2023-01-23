// @ts-ignore
import createHash = require('@airgap/coinlib-core/dependencies/src/create-hash-1.2.0/index')

import { FetchDataForAddressExtension, FetchDataForAddressProtocol } from '../protocol/extensions/address/FetchDataForAddressExtension'
import {
  FetchDataForMultipleAddressesExtension,
  FetchDataForMultipleAddressesProtocol
} from '../protocol/extensions/address/FetchDataForMultipleAddressesExtension'
import {
  MultiAddressPublicKeyExtension,
  MultiAddressPublicKeyProtocol
} from '../protocol/extensions/address/MultiAddressPublicKeyExtension'
import { BaseBip32Protocol, Bip32Extension, OfflineBip32Protocol, OnlineBip32Protocol } from '../protocol/extensions/bip/Bip32Extension'
import { ConfigurableContractProtocol } from '../protocol/extensions/contract/ConfigurableContractExtension'
import { AES, AESExtension } from '../protocol/extensions/crypto/AESExtension'
import {
  AsymmetricEncryptionExtension,
  BaseAsymmetricEncryption,
  OfflineAsymmetricEncryption
} from '../protocol/extensions/crypto/AsymmetricEncryptionExtension'
import { BaseSignMessage, OfflineSignMessage, SignMessageExtension } from '../protocol/extensions/crypto/SignMessageExtension'
import {
  BaseMultiTokenSubProtocol,
  MultiTokenSubProtocolExtension,
  OnlineMultiTokenSubProtocol
} from '../protocol/extensions/sub-protocol/MultiTokenSubProtocolExtension'
import {
  SingleTokenSubProtocol,
  SingleTokenSubProtocolExtension
} from '../protocol/extensions/sub-protocol/SingleTokenSubProtocolExtension'
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
  getExtendedKeyPairFromSecret: 'required',
  deriveFromExtendedSecretKey: 'required'
}

const bip32OnlineProtocolSchema: Schema<OnlineBip32Protocol> = {
  ...bip32BaseProtocolSchema,
  ...onlineProtocolSchema
}

const subProtocolSchema: Schema<SubProtocol> = {
  getType: 'required',
  mainProtocol: 'required'
}

const singleTokenSubProtocolSchema: Schema<SingleTokenSubProtocol> = {
  ...subProtocolSchema,
  getContractAddress: 'required'
}

const multiTokenSubProtocolBaseSchema: Schema<BaseMultiTokenSubProtocol> = singleTokenSubProtocolSchema
const multiTokenSubProtocolOnlineSchema: Schema<OnlineMultiTokenSubProtocol> = {
  ...multiTokenSubProtocolBaseSchema,
  ...onlineProtocolSchema
}

const fetchDataForAddressProtocolSchema: Schema<FetchDataForAddressProtocol> = {
  getBalanceOfAddress: 'required',
  getTransactionsForAddress: 'required'
}

const fetchDataForMultipleAddressesProtocolSchema: Schema<FetchDataForMultipleAddressesProtocol> = {
  getBalanceOfAddresses: 'required',
  getTransactionsForAddresses: 'required'
}

const multiAddressPublicKeyProtocolSchema: Schema<MultiAddressPublicKeyProtocol> = {
  getNextAddressFromPublicKey: 'required'
}

const configurableContractProtocolSchema: Schema<ConfigurableContractProtocol> = {
  isContractValid: 'required',
  getContractAddress: 'required',
  setContractAddress: 'required'
}

const aesEncryptionSchema: Schema<AES> = {
  decryptAESWithSecretKey: 'required',
  encryptAESWithSecretKey: 'required'
}

const asymmetricEncryptionBaseSchema: Schema<BaseAsymmetricEncryption> = {
  encryptAsymmetricWithPublicKey: 'required'
}

const asymmetricEncryptionOfflineSchema: Schema<OfflineAsymmetricEncryption> = {
  ...asymmetricEncryptionBaseSchema,
  decryptAsymmetricWithKeyPair: 'required'
}

const signMessageBaseSchema: Schema<BaseSignMessage> = {
  verifyMessageWithPublicKey: 'required'
}

const signMessageOfflineSchema: Schema<OfflineSignMessage> = {
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

export function isOfflineProtocol(object: AnyProtocol): object is OfflineProtocol {
  return implementsInterface<OfflineProtocol>(object, offlineProtocolSchema)
}

export function isOnlineProtocol(object: AnyProtocol): object is OnlineProtocol {
  return implementsInterface<OnlineProtocol>(object, onlineProtocolSchema)
}

function isOfflineBip32Protocol(protocol: OfflineProtocol): protocol is OfflineProtocol & OfflineBip32Protocol {
  return implementsInterface<OfflineBip32Protocol>(protocol, bip32OfflineProtocolSchema)
}

function isOnlineBip32Protocol(protocol: OnlineProtocol): protocol is OnlineProtocol & OnlineBip32Protocol {
  return implementsInterface<OnlineBip32Protocol>(protocol, bip32OnlineProtocolSchema)
}

export function isBip32Protocol<T extends AnyProtocol>(protocol: T): protocol is T & Bip32Extension<T> {
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

export function isSingleTokenSubProtocol<T extends AnyProtocol>(protocol: T): protocol is T & SingleTokenSubProtocolExtension<T> {
  return implementsInterface<SingleTokenSubProtocol>(protocol, singleTokenSubProtocolSchema)
}

export function isMultiTokenSubProtocol<T extends AnyProtocol>(protocol: T): protocol is T & MultiTokenSubProtocolExtension<T> {
  let extendedWithMultiTokenSubProtocol: boolean = implementsInterface<BaseMultiTokenSubProtocol>(protocol, multiTokenSubProtocolBaseSchema)

  if (isOnlineProtocol(protocol)) {
    extendedWithMultiTokenSubProtocol &&= implementsInterface<OnlineMultiTokenSubProtocol>(protocol, multiTokenSubProtocolOnlineSchema)
  }

  return extendedWithMultiTokenSubProtocol
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
  return implementsInterface<MultiAddressPublicKeyProtocol>(protocol, multiAddressPublicKeyProtocolSchema)
}

export function hasConfigurableContract<T extends AnyProtocol>(protocol: T): protocol is T & ConfigurableContractProtocol {
  return implementsInterface<ConfigurableContractProtocol>(protocol, configurableContractProtocolSchema)
}

export function canEncryptAES<T extends OfflineProtocol>(protocol: T): protocol is T & AESExtension<T> {
  return implementsInterface<AES>(protocol, aesEncryptionSchema)
}

export function canEncryptAsymmetric<T extends AnyProtocol>(protocol: T): protocol is T & AsymmetricEncryptionExtension<T> {
  let extendedWithAsymmetricEncryption: boolean = implementsInterface<BaseAsymmetricEncryption>(protocol, asymmetricEncryptionBaseSchema)

  if (isOfflineProtocol(protocol)) {
    extendedWithAsymmetricEncryption &&= implementsInterface<OfflineAsymmetricEncryption>(protocol, asymmetricEncryptionOfflineSchema)
  }

  return extendedWithAsymmetricEncryption
}

export function canSignMessage<T extends AnyProtocol>(protocol: T): protocol is T & SignMessageExtension<T> {
  let extendedWithSignMessage: boolean = implementsInterface<BaseSignMessage>(protocol, signMessageBaseSchema)

  if (isOfflineProtocol(protocol)) {
    extendedWithSignMessage &&= implementsInterface<OfflineSignMessage>(protocol, signMessageOfflineSchema)
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
