import { SubstrateTransactionType } from '../data/transaction/SubstrateTransaction'

export const supportedRpcMethods = {
  author: ['submitExtrinsic'] as const,
  chain: ['getBlock', 'getBlockHash'] as const,
  state: ['getMetadata', 'getStorage', 'getRuntimeVersion'] as const,
  payment: ['queryInfo'] as const
}

// to keep the generated API as minimal required
export const supportedStorageEntries = {
  Identity: ['IdentityOf', 'SuperOf', 'SubsOf'] as const,
  Staking: [
    'Bonded',
    'Ledger',
    'Payee',
    'Nominators',
    'CurrentEra',
    'ActiveEra',
    'ErasStakers',
    'ErasStakersClipped',
    'ErasValidatorPrefs',
    'ErasValidatorReward',
    'ErasRewardPoints',
    'SlashingSpans'
  ] as const,
  Session: ['Validators'] as const,
  System: ['Account'] as const
}

export const supportedCalls = {
  Balances: ['transfer'] as const,
  Staking: [
    'bond',
    'bond_extra',
    'unbond',
    'withdraw_unbonded',
    'nominate',
    'chill',
    'set_payee',
    'set_controller',
    'payout_stakers'
  ] as const,
  Utility: ['batch'] as const
}

export const supportedConstants = {
  Babe: ['EpochDuration', 'ExpectedBlockTime'] as const,
  Balances: ['ExistentialDeposit'] as const,
  Staking: ['SessionsPerEra'] as const
}

export type SubstrateRpcModuleName = keyof typeof supportedRpcMethods
export type SubstrateRpcMethodName<T extends SubstrateRpcModuleName> = {
  [S in T]: typeof supportedRpcMethods[S][number]
}[T]

export type SubstrateStorageModuleName = keyof typeof supportedStorageEntries
export type SubstrateStorageEntryName<T extends SubstrateStorageModuleName> = {
  [S in T]: typeof supportedStorageEntries[S][number]
}[T]

export type SubstrateCallModuleName = keyof typeof supportedCalls
export type SubstrateCallName<T extends SubstrateCallModuleName> = {
  [S in T]: typeof supportedCalls[S][number]
}[T]

export type SubstrateConstantModuleName = keyof typeof supportedConstants
export type SubstrateConstantName<T extends SubstrateConstantModuleName> = {
  [S in T]: typeof supportedConstants[S][number]
}[T]

export const supportedCallEndpoints: Map<SubstrateTransactionType, [SubstrateCallModuleName, SubstrateCallName<any>]> = new Map([
  createCallEndpointEntry(SubstrateTransactionType.TRANSFER, 'Balances', 'transfer'),
  createCallEndpointEntry(SubstrateTransactionType.BOND, 'Staking', 'bond'),
  createCallEndpointEntry(SubstrateTransactionType.UNBOND, 'Staking', 'unbond'),
  createCallEndpointEntry(SubstrateTransactionType.BOND_EXTRA, 'Staking', 'bond_extra'),
  createCallEndpointEntry(SubstrateTransactionType.WITHDRAW_UNBONDED, 'Staking', 'withdraw_unbonded'),
  createCallEndpointEntry(SubstrateTransactionType.NOMINATE, 'Staking', 'nominate'),
  createCallEndpointEntry(SubstrateTransactionType.CANCEL_NOMINATION, 'Staking', 'chill'),
  createCallEndpointEntry(SubstrateTransactionType.COLLECT_PAYOUT, 'Staking', 'payout_stakers'),
  createCallEndpointEntry(SubstrateTransactionType.SET_PAYEE, 'Staking', 'set_payee'),
  createCallEndpointEntry(SubstrateTransactionType.SET_CONTROLLER, 'Staking', 'set_controller'),
  createCallEndpointEntry(SubstrateTransactionType.SUBMIT_BATCH, 'Utility', 'batch')
])

function createCallEndpointEntry<M extends SubstrateCallModuleName, C extends SubstrateCallName<M>>(
  transactionType: SubstrateTransactionType,
  moduleName: M,
  callName: C
): [SubstrateTransactionType, [SubstrateCallModuleName, SubstrateCallName<any>]] {
  return [transactionType, [moduleName, callName]]
}
