import { PolkadotTransactionType } from '../transaction/data/PolkadotTransaction'

export const supportedRpcMethods = {
    'author': [
        'submitExtrinsic'
    ] as const,
    'chain': [
        'getBlock',
        'getBlockHash'
    ] as const,
    'state': [
        'getMetadata',
        'getStorage',
        'getRuntimeVersion'
    ] as const,
    'payment': [
        'queryInfo'
    ] as const
}

// to keep the generated API as minimal required
export const supportedStorageEntries = {
    'Identity': [
        'IdentityOf'
    ] as const,
    'Staking': [
        'Bonded', 
        'Ledger', 
        'Payee', 
        'Validators', 
        'Nominators', 
        'CurrentEra', 
        'ActiveEra', 
        'ErasStakers',
        'ErasStakersClipped',
        'ErasValidatorPrefs',
        'ErasValidatorReward',
        'ErasRewardPoints'
    ] as const,
    'Session': [
        'Validators'
    ] as const,
    'System': [
        'Account'
    ] as const
}

export const supportedCalls = {
    'Balances': [
        'transfer'
    ] as const,
    'Staking': [
        'bond',
        'bond_extra',
        'unbond',
        'withdraw_unbonded',
        'nominate',
        'chill',
        'set_payee',
        'set_controller',
        'payout_nominator'
    ] as const
}

export const supportedConstants = {
    'Babe': [
        'EpochDuration',
        'ExpectedBlockTime'
    ] as const,
    'Balances': [
        'ExistentialDeposit'
    ] as const,
    'Staking': [
        'SessionsPerEra'
    ] as const,
    'TransactionPayment': [
        'TransactionBaseFee'
    ] as const
}

export type PolkadotRpcModuleName = keyof typeof supportedRpcMethods
export type PolkadotRpcMethodName<T extends PolkadotRpcModuleName> = {
    [S in T]: (typeof supportedRpcMethods[S])[number]
}[T]

export type PolkadotStorageModuleName = keyof typeof supportedStorageEntries
export type PolkadotStorageEntryName<T extends PolkadotStorageModuleName> = {
    [S in T]: (typeof supportedStorageEntries[S])[number]
}[T]

export type PolkadotCallModuleName = keyof typeof supportedCalls
export type PolkadotCallName<T extends PolkadotCallModuleName> = {
    [S in T]: (typeof supportedCalls[S])[number]
}[T]

export type PolkadotConstantModuleName = keyof typeof supportedConstants
export type PolkadotConstantName<T extends PolkadotConstantModuleName> = {
    [S in T]: (typeof supportedConstants[S])[number]
}[T]

export const supportedCallEndpoints: Map<PolkadotTransactionType, [PolkadotCallModuleName, PolkadotCallName<any>]> = new Map([
    createCallEndpointEntry(PolkadotTransactionType.TRANSFER, 'Balances', 'transfer'),
    createCallEndpointEntry(PolkadotTransactionType.BOND, 'Staking', 'bond'),
    createCallEndpointEntry(PolkadotTransactionType.UNBOND, 'Staking', 'unbond'),
    createCallEndpointEntry(PolkadotTransactionType.BOND_EXTRA, 'Staking', 'bond_extra'),
    createCallEndpointEntry(PolkadotTransactionType.WITHDRAW_UNBONDED, 'Staking', 'withdraw_unbonded'),
    createCallEndpointEntry(PolkadotTransactionType.NOMINATE, 'Staking', 'nominate'),
    createCallEndpointEntry(PolkadotTransactionType.STOP_NOMINATING, 'Staking', 'chill'),
    createCallEndpointEntry(PolkadotTransactionType.COLLECT_PAYOUT, 'Staking', 'payout_nominator'),
    createCallEndpointEntry(PolkadotTransactionType.SET_PAYEE, 'Staking', 'set_payee'),
    createCallEndpointEntry(PolkadotTransactionType.SET_CONTROLLER, 'Staking', 'set_controller')
])

function createCallEndpointEntry<M extends PolkadotCallModuleName, C extends PolkadotCallName<M>>(
    transactionType: PolkadotTransactionType,
    moduleName: M,
    callName: C
): [PolkadotTransactionType, [PolkadotCallModuleName, PolkadotCallName<any>]] {
    return [transactionType, [moduleName, callName]]
}