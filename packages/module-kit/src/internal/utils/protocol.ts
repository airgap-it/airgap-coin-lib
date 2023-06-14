// Schemas

import { AnyProtocol } from '../../protocol/protocol'
import { implementsInterface, Schema } from '../../utils/interface'
import { AirGapDelegateProtocol } from '../protocol/AirGapDelegateProtocol'

export const delegateProtocolSchema: Schema<AirGapDelegateProtocol> = {
  getCurrentDelegateesForAddress: 'required',
  getCurrentDelegateesForPublicKey: 'required',
  getDefaultDelegatee: 'required',
  getDelegateeDetails: 'required',
  getDelegationDetailsFromAddress: 'required',
  getDelegationDetailsFromPublicKey: 'required',
  getDelegatorDetailsFromAddress: 'required',
  getDelegatorDetailsFromPublicKey: 'required',
  isAddressDelegating: 'required',
  isPublicKeyDelegating: 'required',
  prepareDelegatorActionFromPublicKey: 'required'
}

// Implementation Checks

export function supportsDelegation(object: AnyProtocol): object is AnyProtocol & AirGapDelegateProtocol {
  return implementsInterface<AirGapDelegateProtocol>(object, delegateProtocolSchema)
}
