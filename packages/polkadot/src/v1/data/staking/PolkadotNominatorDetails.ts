import { DelegatorDetails } from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'

export interface PolkadotLockedDetails {
  value: string
  expectedUnlock: number
}

export interface PolkadotNominatorRewardDetails {
  eraIndex: number
  amount: string
  exposures: [string, number][]
  timestamp: number
}

export type PolkadotStakingStatus = 'bonded' | 'nominating' | 'nominating_waiting' | 'nominating_inactive'

export interface PolkadotStakingDetails {
  total: string
  active: string
  unlocked: string
  locked: PolkadotLockedDetails[]
  status: PolkadotStakingStatus
  nextEra: number
  rewards: PolkadotNominatorRewardDetails[]
}

export interface PolkadotNominatorDetails extends DelegatorDetails {
  stakingDetails?: PolkadotStakingDetails
}
