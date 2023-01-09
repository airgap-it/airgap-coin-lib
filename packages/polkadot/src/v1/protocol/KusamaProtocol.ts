import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'

import { PolkadotProtocolConfiguration } from '../types/configuration'
import { KusamaUnits, PolkadotProtocolNetwork, PolkadotProtocolOptions } from '../types/protocol'

import { PolkadotBaseProtocol, PolkadotBaseProtocolImpl } from './PolkadotBaseProtocol'
import { POLKADOT_CONFIGURATION } from './PolkadotProtocol'

// Interface

export interface KusamaProtocol extends PolkadotBaseProtocol<KusamaUnits> {}

// Implementation

export const KUSAMA_METADATA: ProtocolMetadata<KusamaUnits> = {
  identifier: MainProtocolSymbols.KUSAMA,
  name: 'Kusama',

  units: {
    KSM: {
      symbol: { value: 'KSM' },
      decimals: 12
    },
    mKSM: {
      symbol: { value: 'mKSM' },
      decimals: 9
    },
    uKSM: {
      symbol: { value: 'uKSM' },
      decimals: 6
    },
    Point: {
      symbol: { value: 'Point' },
      decimals: 3
    },
    Planck: {
      symbol: { value: 'Planck' },
      decimals: 0
    }
  },
  mainUnit: 'KSM',

  account: {
    standardDerivationPath: `m/44'/434'/0'/0/0`,
    address: {
      isCaseSensitive: true,
      placeholder: `C/D/E/F/G/H/J...`,
      regex: '^[C-HJ][a-km-zA-HJ-NP-Z1-9]+$'
    }
  }
}

export const KUSAMA_CONFIGURATION: PolkadotProtocolConfiguration = {
  ...POLKADOT_CONFIGURATION,
  account: {
    type: 'ss58',
    format: 2
  }
}

export class KusamaProtocolImpl extends PolkadotBaseProtocolImpl<KusamaUnits> implements KusamaProtocol {
  public constructor(options: RecursivePartial<PolkadotProtocolOptions> = {}) {
    const completeOptions: PolkadotProtocolOptions = createKusamaProtocolOptions(options.network)

    const metadata: ProtocolMetadata<KusamaUnits> = KUSAMA_METADATA
    const configuration: PolkadotProtocolConfiguration = KUSAMA_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createKusamaProtocol(options: RecursivePartial<PolkadotProtocolOptions> = {}): KusamaProtocol {
  return new KusamaProtocolImpl(options)
}

export const KUSAMA_MAINNET_PROTOCOL_NETWORK: PolkadotProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://polkadot-kusama-node.prod.gke.papers.tech',
  blockExplorerApi: 'https://kusama.subscan.prod.gke.papers.tech/api/scan'
}

const DEFAULT_KUSAMA_PROTOCOL_NETWORK: PolkadotProtocolNetwork = KUSAMA_MAINNET_PROTOCOL_NETWORK

export function createKusamaProtocolOptions(network: Partial<PolkadotProtocolNetwork> = {}): PolkadotProtocolOptions {
  return {
    network: { ...DEFAULT_KUSAMA_PROTOCOL_NETWORK, ...network }
  }
}
