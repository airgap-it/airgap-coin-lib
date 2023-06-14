import { FeeDefaults, ProtocolNetwork, ProtocolUnitsMetadata } from '@airgap/module-kit'

export type EthereumUnits = 'ETH' | 'GWEI' | 'WEI'

export interface EthereumProtocolNetwork extends ProtocolNetwork {
  chainId: number
  blockExplorerApi: string
}

export interface EthereumProtocolOptions<_ProtocolNetwork extends EthereumProtocolNetwork = EthereumProtocolNetwork> {
  network: _ProtocolNetwork
}

export interface EthereumBaseProtocolOptions<
  _Units extends string = EthereumUnits,
  _ProtocolNetwork extends EthereumProtocolNetwork = EthereumProtocolNetwork
> extends EthereumProtocolOptions<_ProtocolNetwork> {
  identifier: string
  name: string

  units: ProtocolUnitsMetadata<_Units>
  mainUnit: _Units

  feeDefaults?: FeeDefaults<EthereumUnits>

  standardDerivationPath?: string
}

export interface ERC20ProtocolOptions<_Units extends string, _ProtocolNetwork extends EthereumProtocolNetwork = EthereumProtocolNetwork>
  extends EthereumProtocolOptions<_ProtocolNetwork> {
  name: string
  identifier: string

  contractAddress: string

  units: ProtocolUnitsMetadata<_Units>
  mainUnit: _Units
}

export interface ERC20TokenOptions<_ProtocolNetwork extends EthereumProtocolNetwork = EthereumProtocolNetwork>
  extends ERC20ProtocolOptions<string, _ProtocolNetwork> {
  mainIdentifier: string
}

export interface ERC20TokenMetadata {
  name: string
  identifier: string

  symbol: string
  marketSymbol: string

  contractAddress: string

  decimals: number
}
