export type PolkadotValidatorStatus = 'Active' | 'Inactive' | 'Reaped'

export interface PolkadotValidatorRewardDetails {
    amount: string
    totalStake: string
    ownStake: string
    commission: string
}

export interface PolkadotValidatorDetails {
    name: string | null,
    status: PolkadotValidatorStatus | null,
    ownStash: string | null
    totalStakingBalance: string | null,
    commission: string | null
    lastEraReward: PolkadotValidatorRewardDetails | null
}