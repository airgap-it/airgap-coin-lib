import { SubstrateProtocolConfiguration, SubstrateRpcConfiguration, SubstrateSS58AccountConfiguration } from '@airgap/substrate/v1'
import { CALLS, CONSTANTS, STORAGE_ENTRIES } from '../node/PolkadotNodeClient'

export type PolkadotTransactionType =
  | 'bond'
  | 'unbond'
  | 'rebond'
  | 'bond_extra'
  | 'withdraw_unbonded'
  | 'nominate'
  | 'cancel_nomination'
  | 'collect_payout'
  | 'set_payee'
  | 'set_controller'

export interface PolkadotProtocolConfiguration
  extends SubstrateProtocolConfiguration<SubstrateSS58AccountConfiguration, PolkadotTransactionType, PolkadotRpcConfiguration> {
  rpc: PolkadotRpcConfiguration
  epochDuration: string
}

export interface PolkadotRpcConfiguration extends SubstrateRpcConfiguration {
  storageEntries: typeof STORAGE_ENTRIES
  calls: typeof CALLS
  constants: typeof CONSTANTS
}
