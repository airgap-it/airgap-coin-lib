import { RecursivePartial } from '@airgap/module-kit'

import { EtherscanInfoClient } from '../clients/info/EtherscanInfoClient'
import { AirGapNodeClient } from '../clients/node/AirGapNodeClient'
import { EthereumProtocolNetwork, EthereumProtocolOptions } from '../types/protocol'

import * as EthereumBaseProtocol from './EthereumBaseProtocol'

// Interface

export interface EthereumClassicProtocol extends EthereumBaseProtocol.EthereumBaseProtocol {}

// Implementation

class EthereumClassicProtocolImpl extends EthereumBaseProtocol.DefaultEthereumBaseProtocolImpl implements EthereumClassicProtocol {
  public constructor(options: RecursivePartial<EthereumProtocolOptions> = {}) {
    const completeOptions: EthereumProtocolOptions = createEthereumClassicProtocolOptions(options.network)

    super(
      new AirGapNodeClient(completeOptions.network.rpcUrl),
      new EtherscanInfoClient(completeOptions.network.blockExplorerApi),
      completeOptions
    )
  }
}

// Factory

export function createEthereumClassicProtocol(options: RecursivePartial<EthereumProtocolOptions> = {}): EthereumClassicProtocol {
  return new EthereumClassicProtocolImpl(options)
}

const MAINNET_NAME: string = 'Mainnet'
const NODE_URL: string = 'https://mew.epool.io'
const CHAIN_ID: number = 61
const BLOCK_EXPLORER_API: string = 'https://classic.trustwalletapp.com'
export const ETHEREUM_CLASSIC_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  name: MAINNET_NAME,
  type: 'mainnet',
  rpcUrl: NODE_URL,
  chainId: CHAIN_ID,
  blockExplorerApi: BLOCK_EXPLORER_API
}

const DEFAULT_ETHEREUM_CLASSIC_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_CLASSIC_MAINNET_PROTOCOL_NETWORK

export function createEthereumClassicProtocolOptions(network: Partial<EthereumProtocolNetwork> = {}): EthereumProtocolOptions {
  return {
    network: { ...DEFAULT_ETHEREUM_CLASSIC_PROTOCOL_NETWORK, ...network }
  }
}
