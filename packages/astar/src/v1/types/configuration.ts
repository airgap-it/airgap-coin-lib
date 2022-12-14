import { SubstrateProtocolConfiguration, SubstrateSS58AccountConfiguration } from '@airgap/substrate/v1'

export type AstarTransactionType = never

export interface AstarProtocolConfiguration
  extends SubstrateProtocolConfiguration<SubstrateSS58AccountConfiguration, AstarTransactionType> {}
