import { ProtocolNetwork } from '@airgap/module-kit'

export type MinaUnits = 'MINA'

export type MinaNetworkType = 'mainnet' | 'testnet'

export interface MinaProtocolNetwork extends ProtocolNetwork {
  blockExplorerApi: string
  minaType: MinaNetworkType
}

export interface MinaProtocolOptions {
  network: MinaProtocolNetwork
}
