import { SubstrateProtocolNetwork, SubstrateProtocolOptions } from '@airgap/substrate/v1'

import { PolkadotProtocolConfiguration } from './configuration'

export type PolkadotUnits = 'DOT' | 'mDOT' | 'uDOT' | 'Point' | 'Planck'
export type KusamaUnits = 'KSM' | 'mKSM' | 'uKSM' | 'Point' | 'Planck'

export interface PolkadotProtocolNetwork extends SubstrateProtocolNetwork {
  blockExplorerApi: string
  defaultValidator?: string
}

export interface PolkadotProtocolOptions {
  network: PolkadotProtocolNetwork
}

export interface PolkadotBaseProtocolOptions<_Units extends string>
  extends SubstrateProtocolOptions<_Units, PolkadotProtocolConfiguration, PolkadotProtocolNetwork> {}
