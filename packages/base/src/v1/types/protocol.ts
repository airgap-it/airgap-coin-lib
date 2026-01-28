import { EthereumProtocolNetwork, EthereumProtocolOptions } from '@airgap/ethereum/v1'

export interface BaseProtocolNetwork extends EthereumProtocolNetwork {
  gasPriceOracleAddress: string
}

export interface BaseProtocolOptions extends EthereumProtocolOptions<BaseProtocolNetwork> {}
