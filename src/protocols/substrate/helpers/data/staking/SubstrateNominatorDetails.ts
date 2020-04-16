import { DelegatorAction } from '../../../../ICoinDelegateProtocol'

export interface SubstrateLockedDetails {
    value: string
    expectedUnlock: number
}

export interface SubstrateNominatorRewardDetails {
    eraIndex: number
    amount: string
    exposures: [string, number][]
    timestamp: number
    collected: boolean
}

export type SubstrateStakingStatus = 'bonded' | 'nominating' | 'nominating_inactive'

export interface SubstrateStakingDetails {
    total: string
    active: string
    unlocked: string
    locked: SubstrateLockedDetails[]
    status: SubstrateStakingStatus
    nextEra: number
    rewards: SubstrateNominatorRewardDetails[]
}

export interface SubstrateNominatorDetails {
    balance: string
    isDelegating: boolean
    availableActions: DelegatorAction[]
    stakingDetails: SubstrateStakingDetails | null
}