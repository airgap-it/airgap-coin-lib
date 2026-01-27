import {
  aesEncryptionSchema,
  AirGapAnyProtocol,
  asymmetricEncryptionOfflineSchema,
  bip32OfflineProtocolSchema,
  bip32OnlineProtocolSchema,
  fetchDataForAddressProtocolSchema,
  fetchDataForMultipleAddressesProtocolSchema,
  getTokenBalancesSchema,
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
import { BaseBaseProtocol } from '../protocol/BaseBaseProtocol'
import { BaseProtocol } from '../protocol/BaseProtocol'

// Schemas

export const baseBaseProtocolSchema: Schema<BaseBaseProtocol> = {
  ...offlineProtocolSchema,
  ...onlineProtocolSchema,
  ...bip32OfflineProtocolSchema,
  ...bip32OnlineProtocolSchema,
  ...aesEncryptionSchema,
  ...asymmetricEncryptionOfflineSchema,
  ...signMessageOfflineSchema,
  ...fetchDataForAddressProtocolSchema,
  ...fetchDataForMultipleAddressesProtocolSchema,
  ...getTokenBalancesSchema,
  ...transactionStatusCheckerSchema,
  ...walletConnectProtocolSchema
}

export const baseProtocolSchema: Schema<BaseProtocol> = {
  ...baseBaseProtocolSchema
}

export const baseERC20TokenSchema: Schema<ERC20Token> = {
  ...baseBaseProtocolSchema,
  ...singleTokenSubProtocolSchema,
  name: 'required',
  symbol: 'required',
  decimals: 'required',
  tokenMetadata: 'required'
}

// Implementation Checks

export function isAnyBaseProtocol(protocol: AirGapAnyProtocol): protocol is BaseBaseProtocol {
  return implementsInterface<BaseBaseProtocol>(protocol, baseBaseProtocolSchema)
}

export function isBaseProtocol(protocol: AirGapAnyProtocol): protocol is BaseProtocol {
  return implementsInterface<BaseProtocol>(protocol, baseProtocolSchema)
}

export function isBaseERC20Token(protocol: AirGapAnyProtocol): protocol is ERC20Token {
  return implementsInterface<ERC20Token>(protocol, baseERC20TokenSchema)
}
