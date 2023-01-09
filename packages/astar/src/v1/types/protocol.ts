import { SubstrateProtocolNetwork, SubstrateProtocolOptions } from '@airgap/substrate/v1'

import { AstarProtocolConfiguration } from './configuration'

export type AstarUnits = 'ASTR' | 'mASTR' | 'uASTR' | 'nASTR' | 'pASTR' | 'fASTR' | 'aASTR'
export type ShidenUnits = 'SDN' | 'mSDN' | 'uSDN' | 'nSDN' | 'pSDN' | 'fSDN' | 'aSDN'

export interface AstarProtocolNetwork extends SubstrateProtocolNetwork {
  blockExplorerApi: string
}

export interface AstarProtocolOptions {
  network: AstarProtocolNetwork
}

export interface AstarBaseProtocolOptions<_Units extends string>
  extends SubstrateProtocolOptions<_Units, AstarProtocolConfiguration, AstarProtocolNetwork> {}
