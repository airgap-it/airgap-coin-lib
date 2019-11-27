import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'

export class EthereumProtocol extends BaseEthereumProtocol<AirGapNodeClient, EtherscanInfoClient> {
  constructor() {
    super({
      chainID: 1,
      nodeClient: new AirGapNodeClient(),
      infoClient: new EtherscanInfoClient()
    })
  }
}
