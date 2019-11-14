import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { TrustWalletInfoClient } from './clients/info-clients/InfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'

export class EthereumRopstenProtocol extends BaseEthereumProtocol<AirGapNodeClient, TrustWalletInfoClient> {
  constructor() {
    // we probably need another network here, explorer is ok
    super({
      chainID: 3,
      nodeClient: new AirGapNodeClient('https://ropsten.infura.io'),
      infoClient: new TrustWalletInfoClient('https://ropsten.trustwalletapp.com')
    })
  }
}
