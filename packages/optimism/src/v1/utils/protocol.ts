import {
  aesEncryptionSchema,
  AirGapAnyProtocol,
  asymmetricEncryptionOfflineSchema,
  bip32OfflineProtocolSchema,
  bip32OnlineProtocolSchema,
  fetchDataForAddressProtocolSchema,
  fetchDataForMultipleAddressesProtocolSchema,
  implementsInterface,
  offlineProtocolSchema,
  onlineProtocolSchema,
  Schema,
  signMessageOfflineSchema,
  singleTokenSubProtocolSchema,
  transactionStatusCheckerSchema,
  walletConnectProtocolSchema
} from '@airgap/module-kit'

import { ERC20Token } from '../protocol/erc20/ERC20Token'
import { OptimismBaseProtocol } from '../protocol/OptimismBaseProtocol'
import { OptimismProtocol } from '../protocol/OptimismProtocol'

// Schemas

export const optimismBaseProtocolSchema: Schema<OptimismBaseProtocol> = {
  ...offlineProtocolSchema,
  ...onlineProtocolSchema,
  ...bip32OfflineProtocolSchema,
  ...bip32OnlineProtocolSchema,
  ...aesEncryptionSchema,
  ...asymmetricEncryptionOfflineSchema,
  ...signMessageOfflineSchema,
  ...fetchDataForAddressProtocolSchema,
  ...fetchDataForMultipleAddressesProtocolSchema,
  ...transactionStatusCheckerSchema,
  ...walletConnectProtocolSchema
}

export const optimismProtocolSchema: Schema<OptimismProtocol> = {
  ...optimismBaseProtocolSchema
}

export const optimismERC20TokenSchema: Schema<ERC20Token> = {
  ...optimismBaseProtocolSchema,
  ...singleTokenSubProtocolSchema,
  name: 'required',
  symbol: 'required',
  decimals: 'required',
  tokenMetadata: 'required'
}

// Implementation Checks

export function isAnyOptimismProtocol(protocol: AirGapAnyProtocol): protocol is OptimismBaseProtocol {
  return implementsInterface<OptimismBaseProtocol>(protocol, optimismBaseProtocolSchema)
}

export function isOptimismProtocol(protocol: AirGapAnyProtocol): protocol is OptimismProtocol {
  return implementsInterface<OptimismProtocol>(protocol, optimismProtocolSchema)
}

export function isOptimismERC20Token(protocol: AirGapAnyProtocol): protocol is ERC20Token {
  return implementsInterface<ERC20Token>(protocol, optimismERC20TokenSchema)
}
