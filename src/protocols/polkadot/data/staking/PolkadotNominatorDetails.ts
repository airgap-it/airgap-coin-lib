import { DelegatorAction } from '../../../ICoinDelegateProtocol'

export interface PolkadotLockedDetails {
    value: string
    expectedUnlock: number
}

export interface PolkadotNominatorRewardDetails {
    eraIndex: number
    amount: string
    exposures: [string, number][]
    timestamp: number
    collected: boolean
}

export type PolkadotStakingStatus = 'bonded' | 'nominating' | 'nominating_inactive'

export interface PolkadotStakingDetails {
    total: string
    active: string
    unlocked: string
    locked: PolkadotLockedDetails[]
    status: PolkadotStakingStatus
    nextEra: number
    previousRewards: PolkadotNominatorRewardDetails[]
}

export interface PolkadotNominatorDetails {
    balance: string
    isDelegating: boolean
    availableActions: DelegatorAction[]
    stakingDetails: PolkadotStakingDetails | null
}