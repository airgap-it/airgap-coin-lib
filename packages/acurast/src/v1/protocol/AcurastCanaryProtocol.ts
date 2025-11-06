import { MainProtocolSymbols } from '@airgap/coinlib-core'
import { ProtocolMetadata, RecursivePartial } from '@airgap/module-kit'
import { AcurastProtocolConfiguration } from '../types/configuration'
import { AcurastCanaryUnits, AcurastProtocolNetwork, AcurastProtocolOptions } from '../types/protocol'

import { AcurastBaseProtocol, AcurastBaseProtocolImpl } from './AcurastBaseProtocol'
import { ACURAST_CONFIGURATION } from './AcurastProtocol'

//interface
export interface AcurastCanaryProtocol extends AcurastBaseProtocol<AcurastCanaryUnits> {}

// Implementation

export const ACURAST_CANARY_METADATA: ProtocolMetadata<AcurastCanaryUnits> = {
  identifier: MainProtocolSymbols.ACURAST_CANARY,
  name: 'Acurast Canary',

  units: {
    cACU: {
      symbol: { value: 'cACU' },
      decimals: 12
    }
  },
  mainUnit: 'cACU',
  account: {
    standardDerivationPath: `m/44'/434'/0'/0/0`,
    address: {
      isCaseSensitive: true,
      placeholder: `5ABC...`,
      regex: '^5[a-km-zA-HJ-NP-Z1-9]+$'
    }
  }
}

export class AcurastCanaryProtocolImpl extends AcurastBaseProtocolImpl<AcurastCanaryUnits> implements AcurastCanaryProtocol {
  public constructor(options: RecursivePartial<AcurastProtocolOptions> = {}) {
    const completeOptions: AcurastProtocolOptions = createAcurastCanaryProtocolOptions(options.network)

    const metadata: ProtocolMetadata<AcurastCanaryUnits> = ACURAST_CANARY_METADATA
    const configuration: AcurastProtocolConfiguration = ACURAST_CONFIGURATION

    super({ metadata, configuration, network: completeOptions.network })
  }
}

// Factory

export function createAcurastCanaryProtocol(options: RecursivePartial<AcurastProtocolOptions> = {}): AcurastCanaryProtocol {
  return new AcurastCanaryProtocolImpl(options)
}

export const ACURAST_CANARY_PROTOCOL_NETWORK: AcurastProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://public-rpc.canary.acurast.com',
  blockExplorerUrl: 'https://polkadot.js.org/apps/?rpc=wss://acurast-canarynet-ws.prod.gke.papers.tech#/explorer',
  // blockExplorerUrl: 'https://polkadot.js.org/apps/?rpc=wss.collator-1.acurast.papers.tech#/explorer',
  blockExplorerApi: ''
}

const DEFAULT_ACURAST_PROTOCOL_NETWORK: AcurastProtocolNetwork = ACURAST_CANARY_PROTOCOL_NETWORK

export function createAcurastCanaryProtocolOptions(network: Partial<AcurastProtocolNetwork> = {}): AcurastProtocolOptions {
  return {
    network: { ...DEFAULT_ACURAST_PROTOCOL_NETWORK, ...network }
  }
}
