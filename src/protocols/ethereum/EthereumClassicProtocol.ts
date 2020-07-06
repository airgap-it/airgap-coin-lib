import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { EthereumProtocolNetwork, EthereumProtocolNetworkExtras, EthereumProtocolOptions } from './EthereumProtocolOptions'

export class EthereumClassicProtocol extends BaseEthereumProtocol<AirGapNodeClient, EtherscanInfoClient> {
  constructor() {
    // we probably need another network here, explorer is ok

    super(
      new EthereumProtocolOptions(
        new EthereumProtocolNetwork(
          undefined,
          undefined,
          'https://mew.epool.io',
          undefined,
          new EthereumProtocolNetworkExtras(61, 'https://classic.trustwalletapp.com')
        )
      )
    )
  }
}
