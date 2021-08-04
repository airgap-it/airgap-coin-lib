import { DelegateeDetails } from '../../../../ICoinDelegateProtocol'

export interface MoonbeamCollatorDetails extends DelegateeDetails {
  status?: 'Active' | 'Idle' | 'Leaving'
  ownStakingBalance: string
  totalStakingBalance: string
  commission: string
  nominators: number
}