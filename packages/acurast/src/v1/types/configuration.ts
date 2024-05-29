import { SubstrateProtocolConfiguration, SubstrateSS58AccountConfiguration } from '@airgap/substrate/v1'

export type AcurastTransactionType = never

export interface AcurastProtocolConfiguration
  extends SubstrateProtocolConfiguration<SubstrateSS58AccountConfiguration, AcurastTransactionType> {}
