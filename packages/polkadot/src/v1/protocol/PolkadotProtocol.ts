import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'

import { TRANSACTION_TYPES } from '../data/transaction/transaction'
import { CALLS, CONSTANTS, STORAGE_ENTRIES } from '../node/PolkadotNodeClient'
import { PolkadotProtocolConfiguration } from '../types/configuration'
import { PolkadotProtocolNetwork, PolkadotProtocolOptions, PolkadotUnits } from '../types/protocol'

import { PolkadotBaseProtocol, PolkadotBaseProtocolImpl } from './PolkadotBaseProtocol'

// Interface

export interface PolkadotProtocol extends PolkadotBaseProtocol<PolkadotUnits> {}

// Implementation

export const POLKADOT_METADATA: ProtocolMetadata<PolkadotUnits> = {
  identifier: MainProtocolSymbols.POLKADOT,
  name: 'Polkadot',

  units: {
    DOT: {
      symbol: { value: 'DOT' },
      decimals: 10
    },
    mDOT: {
      symbol: { value: 'mDOT' },
      decimals: 7
    },
    uDOT: {
      symbol: { value: 'uDOT' },
      decimals: 4
    },
    Point: {
      symbol: { value: 'Point' },
      decimals: 1
    },
    Planck: {
      symbol: { value: 'Planck' },
      decimals: 0
    }
  },
  mainUnit: 'DOT',

  account: {
    standardDerivationPath: `m/44'/354'/0'/0/0`,
    address: {
      isCaseSensitive: true,
      placeholder: `1ABC...`,
      regex: '^1[a-km-zA-HJ-NP-Z1-9]+$'
    }
  }
}

export const POLKADOT_CONFIGURATION: PolkadotProtocolConfiguration = {
  epochDuration: '2400',
  account: {
    type: 'ss58',
    format: 0
  },
  transaction: {
    version: 5,
    types: TRANSACTION_TYPES
  },
  rpc: {
    storageEntries: STORAGE_ENTRIES,
    calls: CALLS,
    constants: CONSTANTS
  }
}

export class PolkadotProtocolImpl extends PolkadotBaseProtocolImpl<PolkadotUnits> implements PolkadotProtocol {
  public constructor(options: RecursivePartial<PolkadotProtocolOptions> = {}) {
    const completeOptions: PolkadotProtocolOptions = createPolkadotProtocolOptions(options.network)

    const metadata: ProtocolMetadata<PolkadotUnits> = POLKADOT_METADATA
    const configuration: PolkadotProtocolConfiguration = POLKADOT_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createPolkadotProtocol(options: RecursivePartial<PolkadotProtocolOptions> = {}): PolkadotProtocol {
  return new PolkadotProtocolImpl(options)
}

export const POLKADOT_MAINNET_PROTOCOL_NETWORK: PolkadotProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://polkadot-node.prod.gke.papers.tech',
  blockExplorerUrl: 'https://assethub-polkadot.subscan.io',
  blockExplorerApi: 'https://polkadot.subscan.prod.gke.papers.tech/api/v2/scan',
  defaultValidator: '12C9U6zSSoZ6pgwR2ksFyBLgQH6v7dkqqPCRyHceoP8MJRo2'
}

const DEFAULT_POLKADOT_PROTOCOL_NETWORK: PolkadotProtocolNetwork = POLKADOT_MAINNET_PROTOCOL_NETWORK

export function createPolkadotProtocolOptions(network: Partial<PolkadotProtocolNetwork> = {}): PolkadotProtocolOptions {
  return {
    network: { ...DEFAULT_POLKADOT_PROTOCOL_NETWORK, ...network }
  }
}
