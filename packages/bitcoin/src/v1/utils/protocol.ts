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
  signMessageOfflineSchema
} from '@airgap/module-kit'
import { BitcoinProtocol } from '../protocol/BitcoinProtocol'
import { BitcoinSegwitProtocol } from '../protocol/BitcoinSegwitProtocol'
import { BitcoinTaprootProtocol } from '../protocol/BitcoinTaprootProtocol'

// Schemas

export const bitcoinProtocolSchema: Schema<BitcoinProtocol> = {
  ...offlineProtocolSchema,
  ...onlineProtocolSchema,
  ...bip32OfflineProtocolSchema,
  ...bip32OnlineProtocolSchema,
  ...aesEncryptionSchema,
  ...asymmetricEncryptionOfflineSchema,
  ...signMessageOfflineSchema,
  ...fetchDataForAddressProtocolSchema,
  ...fetchDataForMultipleAddressesProtocolSchema,
  _isBitcoinProtocol: 'required'
}

export const bitcoinSegwitProtocolSchema: Schema<BitcoinSegwitProtocol> = {
  ...bitcoinProtocolSchema,
  _isBitcoinSegwitProtocol: 'required'
}

export const bitcoinTaprootProtocolSchema: Schema<BitcoinTaprootProtocol> = {
  ...bitcoinProtocolSchema,
  _isBitcoinTaprootProtocol: 'required'
}

// Implementation Checks

export function isBitcoinProtocol(protocol: AirGapAnyProtocol): protocol is BitcoinProtocol {
  return implementsInterface<BitcoinProtocol>(protocol, bitcoinProtocolSchema)
}

export function isBitcoinSegwitProtocol(protocol: AirGapAnyProtocol): protocol is BitcoinSegwitProtocol {
  return implementsInterface<BitcoinSegwitProtocol>(protocol, bitcoinSegwitProtocolSchema)
}

export function isBitcoinTaprootProtocol(protocol: AirGapAnyProtocol): protocol is BitcoinSegwitProtocol {
  return implementsInterface<BitcoinTaprootProtocol>(protocol, bitcoinTaprootProtocolSchema)
}
