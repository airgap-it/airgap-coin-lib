import { DelegatorDetails } from '../../../../ICoinDelegateProtocol'

export interface MoonbeamDelegatorDetails extends DelegatorDetails {
  totalBond: string
  status?: 'Active' | 'Leaving' | 'ReadyToLeave'
}
