import { FeeDefaults, ProtocolNetwork, ProtocolUnitsMetadata } from '@airgap/module-kit'

export type EthereumUnits = 'ETH' | 'GWEI' | 'WEI'

export interface EthereumProtocolNetwork extends ProtocolNetwork {
  chainId: number
  blockExplorerApi: string
}

export interface EthereumProtocolOptions {
  network: EthereumProtocolNetwork
}

export interface EthereumBaseProtocolOptions<_Units extends string = EthereumUnits> extends EthereumProtocolOptions {
  identifier: string
  name: string

  units: ProtocolUnitsMetadata<_Units>
  mainUnit: _Units

  feeDefaults?: FeeDefaults<EthereumUnits>

  standardDerivationPath?: string
}

export interface ERC20TokenOptions extends EthereumProtocolOptions {
  name: string
  identifier: string

  contractAddress: string

  units: ProtocolUnitsMetadata<string>
  mainUnit: string
}

export interface ERC20TokenMetadata {
  name: string
  identifier: string

  symbol: string
  marketSymbol: string

  contractAddress: string

  decimals: number
}
