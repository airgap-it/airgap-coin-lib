import {
  aesEncryptionSchema,
  AirGapAnyProtocol,
  asymmetricEncryptionOfflineSchema,
  configurableContractProtocolSchema,
  configurableTransactionInjectorSchema,
  fetchDataForAddressProtocolSchema,
  implementsInterface,
  multiAddressPublicKeyProtocolSchema,
  offlineProtocolSchema,
  onlineProtocolSchema,
  Schema,
  signMessageOfflineSchema,
  singleTokenSubProtocolSchema
} from '@airgap/module-kit'
import { delegateProtocolSchema } from '@airgap/module-kit/internal'

import { TezosFA1p2Protocol } from '../../protocol/fa/TezosFA1p2Protocol'
import { TezosFA1Protocol } from '../../protocol/fa/TezosFA1Protocol'
import { TezosFA2Protocol } from '../../protocol/fa/TezosFA2Protocol'
import { TezosFAProtocol } from '../../protocol/fa/TezosFAProtocol'
import { TezosSaplingProtocol } from '../../protocol/sapling/TezosSaplingProtocol'
import { TezosProtocol } from '../../protocol/TezosProtocol'

// Schemas

export const tezosProtocolSchema: Schema<TezosProtocol> = {
  ...offlineProtocolSchema,
  ...onlineProtocolSchema,
  ...aesEncryptionSchema,
  ...asymmetricEncryptionOfflineSchema,
  ...signMessageOfflineSchema,
  ...fetchDataForAddressProtocolSchema,
  ...delegateProtocolSchema,
  isTezosProtocol: 'required',
  bakerDetails: 'required',
  forgeOperation: 'required',
  getDetailsFromWrappedOperation: 'required',
  getMinCycleDuration: 'required',
  getOperationFeeDefaults: 'required',
  prepareOperations: 'required',
  prepareTransactionsWithPublicKey: 'required',
  unforgeOperation: 'required',
  getstakeBalance: 'required',
  getUnfinalizeRequest: 'required',
  getFinalizeableBalance: 'required',
  getTransactionFee: 'required'
}

export const tezosFAProtocolSchema: Schema<TezosFAProtocol> = {
  ...offlineProtocolSchema,
  ...onlineProtocolSchema,
  ...aesEncryptionSchema,
  ...asymmetricEncryptionOfflineSchema,
  ...signMessageOfflineSchema,
  ...fetchDataForAddressProtocolSchema,
  ...singleTokenSubProtocolSchema,
  isTezosFAProtocol: 'required',
  bigMapValue: 'required',
  contractMetadata: 'required',
  getAllTokenMetadata: 'required',
  getTransactions: 'required',
  normalizeTransactionParameters: 'required'
}

export const tezosFA1ProtocolSchema: Schema<TezosFA1Protocol> = {
  ...tezosFAProtocolSchema,
  isTezosFA1Protocol: 'required',
  fetchTokenHolders: 'required',
  getBalance: 'required',
  getTotalSupply: 'required',
  transfer: 'required'
}

export const tezosFA1p2ProtocolSchema: Schema<TezosFA1p2Protocol> = {
  ...tezosFA1ProtocolSchema,
  isTezosFA1p2Protocol: 'required',
  approve: 'required',
  getAllowance: 'required',
  getTokenMetadata: 'required'
}

export const tezosFA2ProtocolSchema: Schema<TezosFA2Protocol> = {
  ...tezosFAProtocolSchema,
  isTezosFA2Protocol: 'required',
  balanceOf: 'required',
  fetchTokenHolders: 'required',
  getTokenId: 'required',
  getTokenMetadata: 'required',
  getTotalSupply: 'required',
  transfer: 'required',
  updateOperators: 'required'
}

export const tezosSaplingProtocolSchema: Schema<TezosSaplingProtocol> = {
  ...offlineProtocolSchema,
  ...onlineProtocolSchema,
  ...multiAddressPublicKeyProtocolSchema,
  ...configurableContractProtocolSchema,
  ...configurableTransactionInjectorSchema,
  isTezosSaplingProtocol: 'required',
  getAddressFromViewingKey: 'required',
  getDetailsFromTransaction: 'required',
  initParameters: 'required',
  parseParameters: 'required',
  prepareContractCalls: 'required',
  prepareSaplingTransaction: 'required',
  prepareShieldTransaction: 'required',
  prepareUnshieldTransaction: 'required',
  wrapSaplingTransactions: 'required'
}

// Implementation Checks

export function isTezosProtocol(protocol: AirGapAnyProtocol): protocol is TezosProtocol {
  return implementsInterface<TezosProtocol>(protocol, tezosProtocolSchema)
}

export function isTezosFAProtocol(protocol: AirGapAnyProtocol): protocol is TezosFAProtocol {
  return implementsInterface<TezosFAProtocol>(protocol, tezosFAProtocolSchema)
}

export function isTezosFA1Protocol(protocol: AirGapAnyProtocol): protocol is TezosFA1Protocol {
  return implementsInterface<TezosFA1Protocol>(protocol, tezosFA1ProtocolSchema)
}

export function isTezosFA1p2Protocol(protocol: AirGapAnyProtocol): protocol is TezosFA1p2Protocol {
  return implementsInterface<TezosFA1p2Protocol>(protocol, tezosFA1p2ProtocolSchema)
}

export function isTezosFA2Protocol(protocol: AirGapAnyProtocol): protocol is TezosFA2Protocol {
  return implementsInterface<TezosFA2Protocol>(protocol, tezosFA2ProtocolSchema)
}

export function isTezosSaplingProtocol(protocol: AirGapAnyProtocol): protocol is TezosSaplingProtocol {
  return implementsInterface<TezosSaplingProtocol>(protocol, tezosSaplingProtocolSchema)
}
