import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { TrustWalletInfoClient } from './clients/info-clients/InfoClient'

export class EthereumClassicProtocol extends BaseEthereumProtocol<AirGapNodeClient, TrustWalletInfoClient> {
  constructor() {
    // we probably need another network here, explorer is ok
    super({
      chainID: 61,
      nodeClient: new AirGapNodeClient('https://mew.epool.io/'),
      infoClient: new TrustWalletInfoClient('https://classic.trustwalletapp.com')
    })
  }
}
