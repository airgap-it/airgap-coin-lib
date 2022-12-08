import { DelegateeDetails } from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'

export type SubstrateValidatorStatus = 'Active' | 'Inactive' | 'Reaped'

export interface SubstrateValidatorRewardDetails {
  amount: string
  totalStake: string
  ownStake: string
  commission: string
}

export interface SubstrateValidatorDetails extends DelegateeDetails {
  status?: SubstrateValidatorStatus
  ownStash?: string
  totalStakingBalance?: string
  commission?: string
  lastEraReward?: SubstrateValidatorRewardDetails
  nominators: number
}
