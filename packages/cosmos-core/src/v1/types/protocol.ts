import { Amount, ProtocolNetwork } from '@airgap/module-kit'

export interface CosmosProtocolNetwork extends ProtocolNetwork {
  useCORSProxy?: boolean
}

export interface CosmosProtocolOptions<Units extends string> {
  network: CosmosProtocolNetwork
  addressPrefix: string
  baseUnit: Units
  defaultGas: Amount<Units>
}
