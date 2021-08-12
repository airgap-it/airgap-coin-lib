import { DelegatorDetails } from '../../../../ICoinDelegateProtocol'

export interface MoonbeamNominatorDetails extends DelegatorDetails {
  totalBond: string
  status?: 'Active' | 'Leaving'
}
