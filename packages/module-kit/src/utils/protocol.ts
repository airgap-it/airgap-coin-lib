import createHash = require('@airgap/coinlib-core/dependencies/src/create-hash-1.2.0/index')

import {
  AirGapAnyExtendedProtocol,
  AirGapExtendedProtocol,
  AirGapOfflineExtendedProtocol,
  AirGapOnlineExtendedProtocol,
  BaseExtendedProtocol
} from '../protocol/AirGapExtendedProtocol'
import { AirGapAnyProtocol, AirGapOfflineProtocol, AirGapOnlineProtocol, AirGapProtocol, BaseProtocol } from '../protocol/AirGapProtocol'
import { ProtocolNetwork } from '../types/protocol'
import { implementsInterface, Schema } from './interface'

const baseProtocolSchema: Schema<BaseProtocol> = {
  convertKeyFormat: 'required',
  encryptAsymmetricWithPublicKey: 'required',
  getAddressFromPublicKey: 'required',
  getDetailsFromTransaction: 'required',
  getMetadata: 'required',
  verifyMessageWithPublicKey: 'required'
}

const offlineProtocolSchema: Schema<AirGapOfflineProtocol> = {
  ...baseProtocolSchema,
  decryptAESWithSecretKey: 'required',
  decryptAsymmetricWithKeyPair: 'required',
  encryptAESWithSecretKey: 'required',
  getKeyPairFromSecret: 'required',
  signMessageWithKeyPair: 'required',
  signTransactionWithSecretKey: 'required'
}

const onlineProtocolSchema: Schema<AirGapOnlineProtocol> = {
  ...baseProtocolSchema,
  broadcastTransaction: 'required',
  getBalanceOfAddresses: 'required',
  getBalanceOfPublicKey: 'required',
  getNetwork: 'required',
  getTransactionFeeWithPublicKey: 'required',
  getTransactionMaxAmountWithPublicKey: 'required',
  getTransactionStatus: 'optional',
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

const sha256hashShort: (input: string) => string = (input: string): string => {
  const hash = createHash('sha256')
  hash.update(input)

  return hash.digest('base64').slice(0, 10)
}

export function protocolNetworkIdentifier(network: ProtocolNetwork): string {
  const hashed: string = sha256hashShort(`${network.name}-${network.rpcUrl}`)

  return `${network.type}-${hashed}`
}
