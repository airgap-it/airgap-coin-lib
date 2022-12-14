import { SubstrateEthAccountConfiguration, SubstrateProtocolConfiguration, SubstrateRpcConfiguration } from '@airgap/substrate/v1'

import { CALLS, CONSTANTS, STORAGE_ENTRIES } from '../node/MoonbeamNodeClient'

export type MoonbeamTransactionType =
  | 'delegate'
  | 'schedule_leave_delegators'
  | 'execute_leave_delegators'
  | 'cancel_leave_delegators'
  | 'schedule_revoke_delegation'
  | 'execute_delegation_request'
  | 'cancel_delegation_request'
  | 'delegator_bond_more'
  | 'schedule_delegator_bond_less'
  | 'execute_candidate_bond_less'
  | 'cancel_candidate_bond_less'

export interface MoonbeamProtocolConfiguration
  extends SubstrateProtocolConfiguration<SubstrateEthAccountConfiguration, MoonbeamTransactionType, MoonbeamRpcConfiguration> {
  rpc: MoonbeamRpcConfiguration
}

export interface MoonbeamRpcConfiguration extends SubstrateRpcConfiguration {
  storageEntries: typeof STORAGE_ENTRIES
  calls: typeof CALLS
  constants: typeof CONSTANTS
}
