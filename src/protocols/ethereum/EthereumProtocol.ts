import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { TrustWalletInfoClient } from './clients/info-clients/InfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'

export class EthereumProtocol extends BaseEthereumProtocol<AirGapNodeClient, TrustWalletInfoClient> {
  constructor() {
    super({
      chainID: 1,
      nodeClient: new AirGapNodeClient(),
      infoClient: new TrustWalletInfoClient()
    })
  }
}
