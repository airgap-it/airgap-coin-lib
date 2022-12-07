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

export const ETHEREUM_CLASSIC_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://mew.epool.io',
  chainId: 61,
  blockExplorerApi: 'https://classic.trustwalletapp.com'
}

const DEFAULT_ETHEREUM_CLASSIC_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_CLASSIC_MAINNET_PROTOCOL_NETWORK

export function createEthereumClassicProtocolOptions(network: Partial<EthereumProtocolNetwork> = {}): EthereumProtocolOptions {
  return {
    network: { ...DEFAULT_ETHEREUM_CLASSIC_PROTOCOL_NETWORK, ...network }
  }
}
