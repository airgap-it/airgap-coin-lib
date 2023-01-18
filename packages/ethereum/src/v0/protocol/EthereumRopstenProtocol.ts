import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { EthereumProtocolNetwork, EthereumProtocolNetworkExtras, EthereumProtocolOptions } from './EthereumProtocolOptions'

export class EthereumRopstenProtocol extends BaseEthereumProtocol<AirGapNodeClient, EtherscanInfoClient> {
  constructor() {
    // we probably need another network here, explorer is ok
    super(
      new EthereumProtocolOptions(
        new EthereumProtocolNetwork(
          undefined,
          undefined,
          'https://ropsten.infura.io',
          undefined,
          new EthereumProtocolNetworkExtras(3, 'https://api-ropsten.etherscan.io/')
        )
      )
    )
  }
}
