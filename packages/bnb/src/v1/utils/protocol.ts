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
import { BnbBaseProtocol } from '../protocol/BnbBaseProtocol'
import { BnbProtocol } from '../protocol/BnbProtocol'

// Schemas

export const bnbBaseProtocolSchema: Schema<BnbBaseProtocol> = {
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

export const bnbProtocolSchema: Schema<BnbProtocol> = {
  ...bnbBaseProtocolSchema
}

export const bnbERC20TokenSchema: Schema<ERC20Token> = {
  ...bnbBaseProtocolSchema,
  ...singleTokenSubProtocolSchema,
  name: 'required',
  symbol: 'required',
  decimals: 'required',
  tokenMetadata: 'required'
}

// Implementation Checks

export function isAnyBnbProtocol(protocol: AirGapAnyProtocol): protocol is BnbBaseProtocol {
  return implementsInterface<BnbBaseProtocol>(protocol, bnbBaseProtocolSchema)
}

export function isBnbProtocol(protocol: AirGapAnyProtocol): protocol is BnbProtocol {
  return implementsInterface<BnbProtocol>(protocol, bnbProtocolSchema)
}

export function isBnbERC20Token(protocol: AirGapAnyProtocol): protocol is ERC20Token {
  return implementsInterface<ERC20Token>(protocol, bnbERC20TokenSchema)
}
