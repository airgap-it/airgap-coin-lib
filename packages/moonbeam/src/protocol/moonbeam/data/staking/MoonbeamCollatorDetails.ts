import { DelegateeDetails } from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'

export interface MoonbeamCollatorDetails extends DelegateeDetails {
  status?: 'Active' | 'Idle' | 'Leaving'
  minEligibleBalance: string
  ownStakingBalance: string
  totalStakingBalance: string
  commission: string
  delegators: number
}
