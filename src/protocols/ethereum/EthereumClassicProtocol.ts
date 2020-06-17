import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { EthereumProtocolConfig, EthereumProtocolNetwork, EthereumProtocolOptions } from './EthereumProtocolOptions'

export class EthereumClassicProtocol extends BaseEthereumProtocol<AirGapNodeClient, EtherscanInfoClient> {
  constructor() {
    // we probably need another network here, explorer is ok

    super(
      new EthereumProtocolOptions(
        new EthereumProtocolNetwork(),
        new EthereumProtocolConfig(
          61,
          new AirGapNodeClient('https://mew.epool.io'),
          new EtherscanInfoClient('https://classic.trustwalletapp.com')
        )
      )
    )
  }
}
