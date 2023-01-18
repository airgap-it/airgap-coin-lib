import { ProtocolNetwork } from '@airgap/module-kit'

export type CosmosUnits = 'atom' | 'uatom'

export interface CosmosProtocolNetwork extends ProtocolNetwork {
  useCORSProxy?: boolean
}

export interface CosmosProtocolOptions {
  network: CosmosProtocolNetwork
}
