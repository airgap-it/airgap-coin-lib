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
  transactionStatusCheckerSchema
} from '@airgap/module-kit'

import { ERC20Protocol } from '../protocol/erc20/ERC20Protocol'
import { ERC20Token } from '../protocol/erc20/ERC20Token'
import { EthereumBaseProtocol } from '../protocol/EthereumBaseProtocol'
import { EthereumProtocol } from '../protocol/EthereumProtocol'

// Schemas

export const ethereumBaseProtocolSchema: Schema<EthereumBaseProtocol> = {
  ...offlineProtocolSchema,
  ...onlineProtocolSchema,
  ...bip32OfflineProtocolSchema,
  ...bip32OnlineProtocolSchema,
  ...aesEncryptionSchema,
  ...asymmetricEncryptionOfflineSchema,
  ...signMessageOfflineSchema,
  ...fetchDataForAddressProtocolSchema,
  ...fetchDataForMultipleAddressesProtocolSchema,
  ...transactionStatusCheckerSchema
}

export const ethereumProtocolSchema: Schema<EthereumProtocol> = {
  ...ethereumBaseProtocolSchema,
  fetchTransactionCountForAddress: 'required',
  getGasPrice: 'required'
}

export const ethereumERC20ProtocolSchema: Schema<ERC20Protocol<string>> = {
  ...ethereumBaseProtocolSchema,
  name: 'required',
  symbol: 'required',
  decimals: 'required'
}

export const ethereumERC20TokenSchema: Schema<ERC20Token> = {
  ...ethereumERC20ProtocolSchema,
  ...singleTokenSubProtocolSchema
}

// Implementation Checks

export function isAnyEthereumProtocol(protocol: AirGapAnyProtocol): protocol is EthereumBaseProtocol {
  return implementsInterface<EthereumBaseProtocol>(protocol, ethereumBaseProtocolSchema)
}

export function isEthereumProtocol(protocol: AirGapAnyProtocol): protocol is EthereumProtocol {
  return implementsInterface<EthereumProtocol>(protocol, ethereumProtocolSchema)
}

export function isEthereumERC20Protocol(protocol: AirGapAnyProtocol): protocol is ERC20Protocol<string> {
  return implementsInterface<ERC20Protocol<string>>(protocol, ethereumERC20ProtocolSchema)
}

export function isEthereumERC20Token(protocol: AirGapAnyProtocol): protocol is ERC20Token {
  return implementsInterface<ERC20Token>(protocol, ethereumERC20TokenSchema)
}
