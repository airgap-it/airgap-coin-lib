import createHash = require('@airgap/coinlib-core/dependencies/src/create-hash-1.2.0/index')

import { MultiAddressAccountExtension, MultiAddressAccountProtocol } from '../protocol/extensions/address/MultiAddressAccountExtension'
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
import {
  TransactionStatusChecker,
  TransactionStatusCheckerExtension
} from '../protocol/extensions/transaction/TransactionStatusCheckerExtension'
import { AnyProtocol, BaseProtocol, OfflineProtocol, OnlineProtocol } from '../protocol/protocol'
import { ProtocolNetwork } from '../types/protocol'

import { implementsInterface, Schema } from './interface'

// Schemas

const baseProtocolSchema: Schema<BaseProtocol> = {
  encryptAsymmetricWithPublicKey: 'required',
  getAddressFromPublicKey: 'required',
  getDetailsFromTransaction: 'required',
  getMetadata: 'required',
  verifyMessageWithPublicKey: 'required'
}

const offlineProtocolSchema: Schema<OfflineProtocol> = {
  ...baseProtocolSchema,
  decryptAESWithSecretKey: 'required',
  decryptAsymmetricWithKeyPair: 'required',
  encryptAESWithSecretKey: 'required',
  getKeyPairFromSecret: 'required',
  signMessageWithKeyPair: 'required',
  signTransactionWithSecretKey: 'required'
}

const onlineProtocolSchema: Schema<OnlineProtocol> = {
  ...baseProtocolSchema,
  broadcastTransaction: 'required',
  getBalanceOfAddress: 'required',
  getBalanceOfPublicKey: 'required',
  getNetwork: 'required',
  getTransactionFeeWithPublicKey: 'required',
  getTransactionMaxAmountWithPublicKey: 'required',
  getTransactionsForAddress: 'required',
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

const multiAddressAccountProtocolSchema: Schema<MultiAddressAccountProtocol> = {
  getBalanceOfAddresses: 'required',
  getTransactionsForAddresses: 'required'
}

const multiAddressPublicKeyProtocolSchema: Schema<MultiAddressNonExtendedPublicKeyProtocol & MultiAddressExtendedPublicKeyProtocol> = {
  getNextAddressFromPublicKey: 'required'
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

export function hasMultiAddressAccounts<T extends OnlineProtocol>(protocol: T): protocol is T & MultiAddressAccountExtension<T> {
  return implementsInterface<MultiAddressAccountProtocol>(protocol, multiAddressAccountProtocolSchema)
}

export function hasMultiAddressPublicKeys<T extends AnyProtocol>(protocol: T): protocol is T & MultiAddressPublicKeyExtension<T> {
  return implementsInterface<MultiAddressNonExtendedPublicKeyProtocol & MultiAddressExtendedPublicKeyProtocol>(
    protocol,
    multiAddressPublicKeyProtocolSchema
  )
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
