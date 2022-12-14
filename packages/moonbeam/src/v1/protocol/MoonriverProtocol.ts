import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'

import { MoonbeamProtocolConfiguration } from '../types/configuration'
import { MoonbeamProtocolNetwork, MoonbeamProtocolOptions, MoonriverUnits } from '../types/protocol'

import { MoonbeamBaseProtocol, MoonbeamBaseProtocolImpl } from './MoonbeamBaseProtocol'
import { MOONBEAM_CONFIGURATION } from './MoonbeamProtocol'

// Interface

export interface MoonriverProtocol extends MoonbeamBaseProtocol<MoonriverUnits> {}

// Implementation

export const MOONRIVER_METADATA: ProtocolMetadata<MoonriverUnits> = {
  identifier: MainProtocolSymbols.MOONRIVER,
  name: 'Moonriver',

  units: {
    MOVR: {
      symbol: { value: 'MOVR' },
      decimals: 18
    },
    mMOVR: {
      symbol: { value: 'mMOVR' },
      decimals: 15
    },
    uMOVR: {
      symbol: { value: 'uMOVR' },
      decimals: 12
    },
    GWEI: {
      symbol: { value: 'GWEI' },
      decimals: 9
    },
    MWEI: {
      symbol: { value: 'MWEI' },
      decimals: 6
    },
    kWEI: {
      symbol: { value: 'kWEI' },
      decimals: 3
    },
    WEI: {
      symbol: { value: 'WEI' },
      decimals: 0
    }
  },
  mainUnit: 'MOVR',

  account: {
    standardDerivationPath: `m/44'/60'/0'/0/0`,
    address: {
      isCaseSensitive: false,
      placeholder: '0xabc...',
      regex: '^0x[a-fA-F0-9]{40}$'
    }
  }
}

export const MOONRIVER_CONFIGURATION: MoonbeamProtocolConfiguration = MOONBEAM_CONFIGURATION

export class MoonriverProtocolImpl extends MoonbeamBaseProtocolImpl<MoonriverUnits> implements MoonriverProtocol {
  public constructor(options: RecursivePartial<MoonbeamProtocolOptions> = {}) {
    const completeOptions: MoonbeamProtocolOptions = createMoonriverProtocolOptions(options.network)

    const metadata: ProtocolMetadata<MoonriverUnits> = MOONRIVER_METADATA
    const configuration: MoonbeamProtocolConfiguration = MOONRIVER_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createMoonriverProtocol(options: RecursivePartial<MoonbeamProtocolOptions> = {}): MoonriverProtocol {
  return new MoonriverProtocolImpl(options)
}

export const MOONRIVER_MAINNET_PROTOCOL_NETWORK: MoonbeamProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://moonriver-proxy.airgap.prod.gke.papers.tech',
  blockExplorerApi: 'https://moonriver.subscan.prod.gke.papers.tech/api/scan'
}

const DEFAULT_MOONRIVER_PROTOCOL_NETWORK: MoonbeamProtocolNetwork = MOONRIVER_MAINNET_PROTOCOL_NETWORK

export function createMoonriverProtocolOptions(network: Partial<MoonbeamProtocolNetwork> = {}): MoonbeamProtocolOptions {
  return {
    network: { ...DEFAULT_MOONRIVER_PROTOCOL_NETWORK, ...network }
  }
}
