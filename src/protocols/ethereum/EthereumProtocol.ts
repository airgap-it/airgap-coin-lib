import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { TrustWalletInfoClient } from './clients/info-clients/InfoClient'

export class EthereumProtocol extends BaseEthereumProtocol<AirGapNodeClient, TrustWalletInfoClient> {
  constructor() {
    super({
      chainID: 1,
      nodeClient: new AirGapNodeClient(),
      infoClient: new TrustWalletInfoClient()
    })
  }
}
