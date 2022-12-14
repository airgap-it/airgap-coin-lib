import { DelegatorDetails } from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'

export interface MoonbeamDelegatorDetails extends DelegatorDetails {
  totalBond: string
  status?: 'Active' | 'Leaving' | 'ReadyToLeave'
}
