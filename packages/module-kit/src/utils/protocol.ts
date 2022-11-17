import {
  AirGapAnyExtendedProtocol,
  AirGapExtendedProtocol,
  AirGapOfflineExtendedProtocol,
  AirGapOnlineExtendedProtocol,
  BaseExtendedProtocol
} from '../protocol/AirGapExtendedProtocol'
import { AirGapAnyProtocol, AirGapOfflineProtocol, AirGapOnlineProtocol, AirGapProtocol, BaseProtocol } from '../protocol/AirGapProtocol'

// TODO: replace with version from coinlib, once it's merged
type Schema<T> = Record<keyof T, 'required' | 'optional'>
function implementsInterface<T>(object: unknown, schema: Schema<T>): object is T {
  if (typeof object !== 'object' || !object) {
    return false
  }

  return Object.keys(schema).every((key) => schema[key] === 'optional' || object[key] !== undefined)
}

const baseProtocolSchema: Schema<BaseProtocol> = {
  convertKeyFormat: 'required',
  encryptAsymmetricWithPublicKey: 'required',
  getAddressFromPublicKey: 'required',
  getDetailsFromTransaction: 'required',
  getMetadata: 'required',
  getNetwork: 'required',
  verifyMessageWithPublicKey: 'required'
}

const offlineProtocolSchema: Schema<AirGapOfflineProtocol> = {
  ...baseProtocolSchema,
  decryptAESWithPrivateKey: 'required',
  decryptAsymmetricWithPrivateKey: 'required',
  encryptAESWithPrivateKey: 'required',
  getKeyPairFromSecret: 'required',
  signMessageWithKeyPair: 'required',
  signTransactionWithPrivateKey: 'required'
}

const onlineProtocolSchema: Schema<AirGapOnlineProtocol> = {
  ...baseProtocolSchema,
  broadcastTransaction: 'required',
  getBalanceOfAddresses: 'required',
  getBalanceOfPublicKey: 'required',
  getTransactionFeeWithPublicKey: 'required',
  getTransactionMaxAmountWithPublicKey: 'required',
  getTransactionStatus: 'required',
  getTransactionsForAddresses: 'required',
  getTransactionsForPublicKey: 'required',
  prepareTransactionWithPublicKey: 'required'
}

const extendedBaseProtocolSchema: Schema<BaseExtendedProtocol> = {
  ...baseProtocolSchema,
  deriveFromExtendedPublicKey: 'required',
  getNextAddressFromPublicKey: 'required'
}

const extendedOfflineProtocolSchema: Schema<AirGapOfflineExtendedProtocol> = {
  ...offlineProtocolSchema,
  ...extendedBaseProtocolSchema,
  getExtendedKeyPairFromSecret: 'required'
}

const extendedOnlineProtocolSchema: Schema<AirGapOnlineExtendedProtocol> = {
  ...onlineProtocolSchema,
  ...extendedBaseProtocolSchema
}

export function isOfflineExtendedProtocol(protocol: AirGapOfflineProtocol): protocol is AirGapOfflineExtendedProtocol {
  return implementsInterface<AirGapOfflineExtendedProtocol>(protocol, extendedOfflineProtocolSchema)
}

export function isOnlineExtendedProtocol(protocol: AirGapOnlineProtocol): protocol is AirGapOnlineExtendedProtocol {
  return implementsInterface<AirGapOnlineExtendedProtocol>(protocol, extendedOnlineProtocolSchema)
}

export function isExtendedProtocol(protocol: AirGapProtocol): protocol is AirGapExtendedProtocol {
  return implementsInterface<AirGapExtendedProtocol>(protocol, { ...extendedOfflineProtocolSchema, ...extendedOnlineProtocolSchema })
}

export function isAnyExtendedProtocol(protocol: AirGapAnyProtocol): protocol is AirGapAnyExtendedProtocol {
  return isOfflineExtendedProtocol(protocol as AirGapOfflineProtocol) || isOnlineExtendedProtocol(protocol as AirGapOnlineProtocol)
}
