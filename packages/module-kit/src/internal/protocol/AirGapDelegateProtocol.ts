import { DelegateeDetails, DelegationDetails, DelegatorDetails } from '@airgap/coinlib-core'

import { Address } from '../../types/address'
import { PublicKey } from '../../types/key'

/**
 * DO NOT USE!
 * This is an internal type and will be removed in future releases.
 */
export interface AirGapDelegateProtocol {
  getDefaultDelegatee(): Promise<Address>
  getCurrentDelegateesForPublicKey(publicKey: PublicKey, data?: any): Promise<Address[]>
  getCurrentDelegateesForAddress(address: Address, data?: any): Promise<Address[]>

  getDelegateeDetails(address: Address, data?: any): Promise<DelegateeDetails>

  isPublicKeyDelegating(publicKey: PublicKey, data?: any): Promise<boolean>
  isAddressDelegating(address: Address, data?: any): Promise<boolean>

  getDelegatorDetailsFromPublicKey(publicKey: PublicKey, data?: any): Promise<DelegatorDetails>
  getDelegatorDetailsFromAddress(address: Address, data?: any): Promise<DelegatorDetails>

  getDelegationDetailsFromPublicKey(publicKey: PublicKey, delegatees: Address[], data?: any): Promise<DelegationDetails>
  getDelegationDetailsFromAddress(address: Address, delegatees: Address[], data?: any): Promise<DelegationDetails>

  prepareDelegatorActionFromPublicKey(publicKey: PublicKey, type: any, data?: any): Promise<any[]>
}
