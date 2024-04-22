import { SubstrateProtocolNetwork, SubstrateProtocolOptions } from '@airgap/substrate/v1'

import { AcurastProtocolConfiguration } from './configuration'

export type AcurastUnits = 'cACU'

export interface AcurastProtocolNetwork extends SubstrateProtocolNetwork {
  blockExplorerApi: string
}

export interface AcurastProtocolOptions {
  network: AcurastProtocolNetwork
}

export interface AcurastBaseProtocolOptions<_Units extends string>
  extends SubstrateProtocolOptions<_Units, AcurastProtocolConfiguration, AcurastProtocolNetwork> {}
