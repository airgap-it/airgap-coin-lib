import { ProtocolNetwork } from '@airgap/module-kit'

export interface AeternityProtocolNetwork extends ProtocolNetwork {
  feesUrl: string
}

export interface AeternityProtocolOptions {
  network: AeternityProtocolNetwork
}

const MAINNET_NAME: string = 'Mainnet'
const NODE_URL: string = 'https://mainnet.aeternity.io'
const FEES_URL: string = 'https://api-airgap.gke.papers.tech/fees'

const DEFAULT_AETERNITY_PROTOCOL_NETWORK: AeternityProtocolNetwork = {
  name: MAINNET_NAME,
  type: 'mainnet',
  rpcUrl: NODE_URL,
  feesUrl: FEES_URL
}

export function createAeternityProtocolOptions(network: Partial<AeternityProtocolNetwork> = {}): AeternityProtocolOptions {
  return {
    network: {
      name: network.name ?? DEFAULT_AETERNITY_PROTOCOL_NETWORK.name,
      type: network.type ?? DEFAULT_AETERNITY_PROTOCOL_NETWORK.type,
      rpcUrl: network.rpcUrl ?? DEFAULT_AETERNITY_PROTOCOL_NETWORK.rpcUrl,
      feesUrl: network.feesUrl ?? DEFAULT_AETERNITY_PROTOCOL_NETWORK.feesUrl
    }
  }
}
