export type SubstrateValidatorStatus = 'Active' | 'Inactive' | 'Reaped'

export interface SubstrateValidatorRewardDetails {
    amount: string
    totalStake: string
    ownStake: string
    commission: string
}

export interface SubstrateValidatorDetails {
    name: string | null,
    status: SubstrateValidatorStatus | null,
    ownStash: string | null
    totalStakingBalance: string | null,
    commission: string | null
    lastEraReward: SubstrateValidatorRewardDetails | null
}