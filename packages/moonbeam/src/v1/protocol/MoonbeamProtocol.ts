import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'
import { SubstrateSignatureType } from '@airgap/substrate/v1'

import { TRANSACTION_TYPES } from '../data/transaction/transaction'
import { CALLS, CONSTANTS, STORAGE_ENTRIES } from '../node/MoonbeamNodeClient'
import { MoonbeamProtocolConfiguration } from '../types/configuration'
import { MoonbeamProtocolNetwork, MoonbeamProtocolOptions, MoonbeamUnits } from '../types/protocol'

import { MoonbeamBaseProtocol, MoonbeamBaseProtocolImpl } from './MoonbeamBaseProtocol'

// Interface

export interface MoonbeamProtocol extends MoonbeamBaseProtocol<MoonbeamUnits> {}

// Implementation

export const MOONBEAM_METADATA: ProtocolMetadata<MoonbeamUnits> = {
  identifier: MainProtocolSymbols.MOONBEAM,
  name: 'Moonbeam',

  units: {
    GLMR: {
      symbol: { value: 'GLMR' },
      decimals: 18
    },
    mGLMR: {
      symbol: { value: 'mGLMR' },
      decimals: 15
    },
    uGLMR: {
      symbol: { value: 'uGLMR' },
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
  mainUnit: 'GLMR',

  account: {
    standardDerivationPath: `m/44'/60'/0'/0/0`,
    address: {
      isCaseSensitive: false,
      placeholder: '0xabc...',
      regex: '^0x[a-fA-F0-9]{40}$'
    }
  }
}

export const MOONBEAM_CONFIGURATION: MoonbeamProtocolConfiguration = {
  account: { type: 'eth' },
  transaction: {
    types: TRANSACTION_TYPES
  },
  signature: {
    fixedType: SubstrateSignatureType.Ecdsa
  },
  rpc: {
    storageEntries: STORAGE_ENTRIES,
    calls: CALLS,
    constants: CONSTANTS
  }
}

export class MoonbeamProtocolImpl extends MoonbeamBaseProtocolImpl<MoonbeamUnits> implements MoonbeamProtocol {
  public constructor(options: RecursivePartial<MoonbeamProtocolOptions> = {}) {
    const completeOptions: MoonbeamProtocolOptions = createMoonbeamProtocolOptions(options.network)

    const metadata: ProtocolMetadata<MoonbeamUnits> = MOONBEAM_METADATA
    const configuration: MoonbeamProtocolConfiguration = MOONBEAM_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createMoonbeamProtocol(options: RecursivePartial<MoonbeamProtocolOptions> = {}): MoonbeamProtocol {
  return new MoonbeamProtocolImpl(options)
}

export const MOONBEAM_MAINNET_PROTOCOL_NETWORK: MoonbeamProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://moonbeam-proxy.airgap.prod.gke.papers.tech',
  blockExplorerUrl: 'https://moonbeam.subscan.io',
  blockExplorerApi: 'https://moonbeam.subscan.prod.gke.papers.tech/api/v2/scan'
}

const DEFAULT_MOONBEAM_PROTOCOL_NETWORK: MoonbeamProtocolNetwork = MOONBEAM_MAINNET_PROTOCOL_NETWORK

export function createMoonbeamProtocolOptions(network: Partial<MoonbeamProtocolNetwork> = {}): MoonbeamProtocolOptions {
  return {
    network: { ...DEFAULT_MOONBEAM_PROTOCOL_NETWORK, ...network }
  }
}
