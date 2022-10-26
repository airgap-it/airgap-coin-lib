import { DelegatorDetails } from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'

export interface SubstrateLockedDetails {
  value: string
  expectedUnlock: number
}

export interface SubstrateNominatorRewardDetails {
  eraIndex: number
  amount: string
  exposures: [string, number][]
  timestamp: number
}

export type SubstrateStakingStatus = 'bonded' | 'nominating' | 'nominating_waiting' | 'nominating_inactive'

export interface SubstrateStakingDetails {
  total: string
  active: string
  unlocked: string
  locked: SubstrateLockedDetails[]
  status: SubstrateStakingStatus
  nextEra: number
  rewards: SubstrateNominatorRewardDetails[]
}

export interface SubstrateNominatorDetails extends DelegatorDetails {
  stakingDetails?: SubstrateStakingDetails
}
