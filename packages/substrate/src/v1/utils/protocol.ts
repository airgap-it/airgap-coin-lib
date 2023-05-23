import {
  aesEncryptionSchema,
  AirGapAnyProtocol,
  asymmetricEncryptionOfflineSchema,
  fetchDataForAddressProtocolSchema,
  implementsInterface,
  offlineProtocolSchema,
  onlineProtocolSchema,
  Schema,
  signMessageOfflineSchema
} from '@airgap/module-kit'

import { SubstrateProtocol } from '../protocol/SubstrateProtocol'

// Schemas

export const substrateProtocolSchema: Schema<SubstrateProtocol> = {
  ...offlineProtocolSchema,
  ...onlineProtocolSchema,
  ...aesEncryptionSchema,
  ...asymmetricEncryptionOfflineSchema,
  ...signMessageOfflineSchema,
  ...fetchDataForAddressProtocolSchema,
  isSubstrateProtocol: 'required',
  encodeDetails: 'required',
  decodeDetails: 'required'
}

// Implementation Checks

export function isSubstrateProtocol(protocol: AirGapAnyProtocol): protocol is SubstrateProtocol {
  return implementsInterface<SubstrateProtocol>(protocol, substrateProtocolSchema)
}
