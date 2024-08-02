import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'

import { AstarProtocolConfiguration } from '../types/configuration'
import { AstarProtocolNetwork, AstarProtocolOptions, AstarUnits } from '../types/protocol'

import { AstarBaseProtocol, AstarBaseProtocolImpl } from './AstarBaseProtocol'

// Interface

export interface AstarProtocol extends AstarBaseProtocol<AstarUnits> {}

// Implementation

export const ASTAR_METADATA: ProtocolMetadata<AstarUnits> = {
  identifier: MainProtocolSymbols.ASTAR,
  name: 'Astar',

  units: {
    ASTR: {
      symbol: { value: 'ASTR' },
      decimals: 18
    },
    mASTR: {
      symbol: { value: 'mASTR' },
      decimals: 15
    },
    uASTR: {
      symbol: { value: 'uASTR' },
      decimals: 12
    },
    nASTR: {
      symbol: { value: 'nASTR' },
      decimals: 9
    },
    pASTR: {
      symbol: { value: 'pASTR' },
      decimals: 6
    },
    fASTR: {
      symbol: { value: 'fASTR' },
      decimals: 3
    },
    aASTR: {
      symbol: { value: 'aASTR' },
      decimals: 0
    }
  },
  mainUnit: 'ASTR',

  account: {
    standardDerivationPath: `m/44'/810'/0'/0/0`,
    address: {
      isCaseSensitive: true,
      placeholder: `ABC...`,
      regex: '^[a-km-zA-HJ-NP-Z1-9]+$'
    }
  }
}

export const ASTAR_CONFIGURATION: AstarProtocolConfiguration = {
  account: {
    type: 'ss58',
    format: 5
  },
  transaction: {
    version: 3,
    types: {}
  }
}

export class AstarProtocolImpl extends AstarBaseProtocolImpl<AstarUnits> implements AstarProtocol {
  public constructor(options: RecursivePartial<AstarProtocolOptions> = {}) {
    const completeOptions: AstarProtocolOptions = createAstarProtocolOptions(options.network)

    const metadata: ProtocolMetadata<AstarUnits> = ASTAR_METADATA
    const configuration: AstarProtocolConfiguration = ASTAR_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createAstarProtocol(options: RecursivePartial<AstarProtocolOptions> = {}): AstarProtocol {
  return new AstarProtocolImpl(options)
}

export const ASTAR_MAINNET_PROTOCOL_NETWORK: AstarProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://astar-node.prod.gke.papers.tech',
  blockExplorerUrl: 'https://astar.subscan.io',
  blockExplorerApi: 'https://astar.subscan.prod.gke.papers.tech/api/v2/scan'
}

const DEFAULT_ASTAR_PROTOCOL_NETWORK: AstarProtocolNetwork = ASTAR_MAINNET_PROTOCOL_NETWORK

export function createAstarProtocolOptions(network: Partial<AstarProtocolNetwork> = {}): AstarProtocolOptions {
  return {
    network: { ...DEFAULT_ASTAR_PROTOCOL_NETWORK, ...network }
  }
}
