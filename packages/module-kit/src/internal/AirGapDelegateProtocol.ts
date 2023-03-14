import { DelegateeDetails, DelegationDetails, DelegatorDetails } from '@airgap/coinlib-core'

import { Address } from '../types/address'
import { PublicKey } from '../types/key'

/**
 * DO NOT USE!
 * This is an internal type and will be removed in future releases.
 */
export interface AirGapDelegateProtocol {
  getDefaultDelegatee(): Promise<Address>
  getCurrentDelegateesForPublicKey(publicKey: PublicKey): Promise<Address[]>
  getCurrentDelegateesForAddress(address: Address): Promise<Address[]>

  getDelegateeDetails(address: Address): Promise<DelegateeDetails>

  isPublicKeyDelegating(publicKey: PublicKey): Promise<boolean>
  isAddressDelegating(address: Address): Promise<boolean>

  getDelegatorDetailsFromPublicKey(publicKey: PublicKey): Promise<DelegatorDetails>
  getDelegatorDetailsFromAddress(address: Address): Promise<DelegatorDetails>

  getDelegationDetailsFromPublicKey(publicKey: PublicKey, delegatees: Address[]): Promise<DelegationDetails>
  getDelegationDetailsFromAddress(address: Address, delegatees: Address[]): Promise<DelegationDetails>

  prepareDelegatorActionFromPublicKey(publicKey: PublicKey, type: any, data?: any): Promise<any[]>
}
