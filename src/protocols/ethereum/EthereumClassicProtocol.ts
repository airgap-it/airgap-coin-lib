import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'

export class EthereumClassicProtocol extends BaseEthereumProtocol<AirGapNodeClient, EtherscanInfoClient> {
  constructor() {
    // we probably need another network here, explorer is ok
    super({
      chainID: 61,
      nodeClient: new AirGapNodeClient('https://mew.epool.io'),
      infoClient: new EtherscanInfoClient('https://classic.trustwalletapp.com')
    })
  }
}
