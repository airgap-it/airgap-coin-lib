import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'

import { AstarProtocolConfiguration } from '../types/configuration'
import { AstarProtocolNetwork, AstarProtocolOptions, ShidenUnits } from '../types/protocol'

import { AstarBaseProtocol, AstarBaseProtocolImpl } from './AstarBaseProtocol'
import { ASTAR_CONFIGURATION } from './AstarProtocol'

// Interface

export interface ShidenProtocol extends AstarBaseProtocol<ShidenUnits> {}

// Implementation

export const SHIDEN_METADATA: ProtocolMetadata<ShidenUnits> = {
  identifier: MainProtocolSymbols.SHIDEN,
  name: 'Shiden',

  units: {
    SDN: {
      symbol: { value: 'SDN' },
      decimals: 18
    },
    mSDN: {
      symbol: { value: 'mSDN' },
      decimals: 15
    },
    uSDN: {
      symbol: { value: 'uSDN' },
      decimals: 12
    },
    nSDN: {
      symbol: { value: 'nSDN' },
      decimals: 9
    },
    pSDN: {
      symbol: { value: 'pSDN' },
      decimals: 6
    },
    fSDN: {
      symbol: { value: 'fSDN' },
      decimals: 3
    },
    aSDN: {
      symbol: { value: 'aSDN' },
      decimals: 0
    }
  },
  mainUnit: 'SDN',

  account: {
    standardDerivationPath: `m/44'/810'/0'/0/0`,
    address: {
      isCaseSensitive: true,
      placeholder: `ABC...`,
      regex: '^[a-km-zA-HJ-NP-Z1-9]+$'
    }
  }
}

export const SHIDEN_CONFIGURATION: AstarProtocolConfiguration = ASTAR_CONFIGURATION

export class ShidenProtocolImpl extends AstarBaseProtocolImpl<ShidenUnits> implements ShidenProtocol {
  public constructor(options: RecursivePartial<AstarProtocolOptions> = {}) {
    const completeOptions: AstarProtocolOptions = createShidenProtocolOptions(options.network)

    const metadata: ProtocolMetadata<ShidenUnits> = SHIDEN_METADATA
    const configuration: AstarProtocolConfiguration = SHIDEN_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createShidenProtocol(options: RecursivePartial<AstarProtocolOptions> = {}): ShidenProtocol {
  return new ShidenProtocolImpl(options)
}

export const SHIDEN_MAINNET_PROTOCOL_NETWORK: AstarProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://shiden-node.prod.gke.papers.tech',
  blockExplorerUrl: 'https://shiden.subscan.io',
  blockExplorerApi: 'https://shiden.subscan.prod.gke.papers.tech/api/v2/scan'
}

const DEFAULT_SHIDEN_PROTOCOL_NETWORK: AstarProtocolNetwork = SHIDEN_MAINNET_PROTOCOL_NETWORK

export function createShidenProtocolOptions(network: Partial<AstarProtocolNetwork> = {}): AstarProtocolOptions {
  return {
    network: { ...DEFAULT_SHIDEN_PROTOCOL_NETWORK, ...network }
  }
}
