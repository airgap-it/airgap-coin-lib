import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'

import { MoonbeamProtocolConfiguration } from '../types/configuration'
import { MoonbaseUnits, MoonbeamProtocolNetwork, MoonbeamProtocolOptions } from '../types/protocol'

import { MoonbeamBaseProtocol, MoonbeamBaseProtocolImpl } from './MoonbeamBaseProtocol'
import { MOONBEAM_CONFIGURATION } from './MoonbeamProtocol'

// Interface

export interface MoonbaseProtocol extends MoonbeamBaseProtocol<MoonbaseUnits> {}

// Implementation

export const MOONBASE_METADATA: ProtocolMetadata<MoonbaseUnits> = {
  identifier: MainProtocolSymbols.MOONBASE,
  name: 'Moonbase',

  units: {
    DEV: {
      symbol: { value: 'DEV' },
      decimals: 18
    },
    mDEV: {
      symbol: { value: 'mDEV' },
      decimals: 15
    },
    uDEV: {
      symbol: { value: 'uDEV' },
      decimals: 12
    },
    nDEV: {
      symbol: { value: 'nDEV' },
      decimals: 9
    },
    pDEV: {
      symbol: { value: 'pDEV' },
      decimals: 6
    },
    fDEV: {
      symbol: { value: 'fDEV' },
      decimals: 3
    },
    aDEV: {
      symbol: { value: 'aDEV' },
      decimals: 0
    }
  },
  mainUnit: 'DEV',

  account: {
    standardDerivationPath: `m/44'/60'/0'/0/0`,
    address: {
      isCaseSensitive: false,
      placeholder: '0xabc...',
      regex: '^0x[a-fA-F0-9]{40}$'
    }
  }
}

export const MOONBASE_CONFIGURATION: MoonbeamProtocolConfiguration = MOONBEAM_CONFIGURATION

export class MoonbaseProtocolImpl extends MoonbeamBaseProtocolImpl<MoonbaseUnits> implements MoonbaseProtocol {
  public constructor(options: RecursivePartial<MoonbeamProtocolOptions> = {}) {
    const completeOptions: MoonbeamProtocolOptions = createMoonbaseProtocolOptions(options.network)

    const metadata: ProtocolMetadata<MoonbaseUnits> = MOONBASE_METADATA
    const configuration: MoonbeamProtocolConfiguration = MOONBASE_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createMoonbaseProtocol(options: RecursivePartial<MoonbeamProtocolOptions> = {}): MoonbaseProtocol {
  return new MoonbaseProtocolImpl(options)
}

export const MOONBASE_MAINNET_PROTOCOL_NETWORK: MoonbeamProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://moonbeam-alpha.api.onfinality.io/public',
  blockExplorerApi: 'https://moonbase.subscan.io/api/scan'
}

const DEFAULT_MOONBASE_PROTOCOL_NETWORK: MoonbeamProtocolNetwork = MOONBASE_MAINNET_PROTOCOL_NETWORK

export function createMoonbaseProtocolOptions(network: Partial<MoonbeamProtocolNetwork> = {}): MoonbeamProtocolOptions {
  return {
    network: { ...DEFAULT_MOONBASE_PROTOCOL_NETWORK, ...network }
  }
}
