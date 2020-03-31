export enum PolkadotValidatorStatus {
    REAPED = 'Reaped',
    INACTIVE = "Inactive",
    ACTIVE = "Active"
}

export interface PolkadotValidatorDetails {
    name: string | null,
    status: PolkadotValidatorStatus | null,
    ownStash: string | null
    totalStakingBalance: string | null,
    commission: string | null
}