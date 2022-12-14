import { MoonbeamCollatorDetails } from './MoonbeamCollatorDetails'
import { MoonbeamDelegatorDetails } from './MoonbeamDelegatorDetails'

export interface MoonbeamDelegationRequest {
  type: 'revoke' | 'decrease'
  amount: string
  executableIn?: number
}
export interface MoonbeamDelegationDetails {
  delegatorDetails: MoonbeamDelegatorDetails
  collatorDetails: MoonbeamCollatorDetails
  bond: string
  pendingRequest?: MoonbeamDelegationRequest
}
