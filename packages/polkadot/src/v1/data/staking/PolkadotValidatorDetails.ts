import { DelegateeDetails } from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'

export type PolkadotValidatorStatus = 'Active' | 'Inactive' | 'Reaped'

export interface PolkadotValidatorRewardDetails {
  amount: string
  totalStake: string
  ownStake: string
  commission: string
}

export interface PolkadotValidatorDetails extends DelegateeDetails {
  status?: PolkadotValidatorStatus
  ownStash?: string
  totalStakingBalance?: string
  commission?: string
  lastEraReward?: PolkadotValidatorRewardDetails
  nominators: number
}
