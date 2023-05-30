import { EthereumProtocolNetwork, EthereumProtocolOptions } from '@airgap/ethereum/v1'

export interface OptimismProtocolNetwork extends EthereumProtocolNetwork {
  gasPriceOracleAddress: string
}

export interface OptimismProtocolOptions extends EthereumProtocolOptions<OptimismProtocolNetwork> {}
