import { BitcoinProtocolOptions } from '@airgap/bitcoin/v1'
import { ProtocolNetwork } from '@airgap/module-kit'

export type GroestlcoinUnits = 'GRS' | 'mGRS' | 'Satoshi'

interface GroestlcoinBaseProtocolNetwork extends ProtocolNetwork {
  indexerApi: string
}

export interface GroestlcoinStandardProtocolNetwork extends GroestlcoinBaseProtocolNetwork {
  type: 'mainnet' | 'testnet'
}
export interface GroestlcoinCustomProtocolNetwork extends GroestlcoinBaseProtocolNetwork {
  type: 'custom'
  bitcoinjsNetworkName: string
}

export type GroestlcoinProtocolNetwork = GroestlcoinStandardProtocolNetwork | GroestlcoinCustomProtocolNetwork

export interface GroestlcoinProtocolOptions extends BitcoinProtocolOptions {
  network: GroestlcoinProtocolNetwork
}
