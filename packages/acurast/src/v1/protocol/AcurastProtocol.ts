import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'
import { AcurastProtocolConfiguration } from '../types/configuration'
import { AcurastProtocolNetwork, AcurastProtocolOptions, AcurastUnits } from '../types/protocol'

import { AcurastBaseProtocol, AcurastBaseProtocolImpl } from './AcurastBaseProtocol'

//interface
export interface AcurastProtocol extends AcurastBaseProtocol<AcurastUnits> {}

// Implementation

export const ACURAST_METADATA: ProtocolMetadata<AcurastUnits> = {
  identifier: MainProtocolSymbols.ACURAST,
  name: 'Acurast',

  units: {
    ACU: {
      symbol: { value: 'ACU' },
      decimals: 12
    }
  },
  mainUnit: 'ACU',

  account: {
    standardDerivationPath: `m/44'/434'/0'/0/0`,
    address: {
      isCaseSensitive: true,
      placeholder: `5ABC...`,
      regex: '^5[a-km-zA-HJ-NP-Z1-9]+$'
    }
  }
}

export const ACURAST_CONFIGURATION: AcurastProtocolConfiguration = {
  account: {
    type: 'ss58',
    format: 42
  },
  transaction: {
    version: 3,
    types: {}
  }
}

export class AcurastProtocolImpl extends AcurastBaseProtocolImpl<AcurastUnits> implements AcurastProtocol {
  public constructor(options: RecursivePartial<AcurastProtocolOptions> = {}) {
    const completeOptions: AcurastProtocolOptions = createAcurastProtocolOptions(options.network)

    const metadata: ProtocolMetadata<AcurastUnits> = ACURAST_METADATA
    const configuration: AcurastProtocolConfiguration = ACURAST_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createAcurastProtocol(options: RecursivePartial<AcurastProtocolOptions> = {}): AcurastProtocol {
  return new AcurastProtocolImpl(options)
}

export const ACURAST_MAINNET_PROTOCOL_NETWORK: AcurastProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://public-rpc.mainnet.acurast.com',
  blockExplorerUrl: 'https://polkadot.js.org/apps/?rpc=wss://acurast-canarynet-ws.prod.gke.papers.tech#/explorer',
  blockExplorerApi: ''
}

const DEFAULT_ACURAST_PROTOCOL_NETWORK: AcurastProtocolNetwork = ACURAST_MAINNET_PROTOCOL_NETWORK

export function createAcurastProtocolOptions(network: Partial<AcurastProtocolNetwork> = {}): AcurastProtocolOptions {
  return {
    network: { ...DEFAULT_ACURAST_PROTOCOL_NETWORK, ...network }
  }
}
