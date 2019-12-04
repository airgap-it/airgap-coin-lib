import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'

export class EthereumRopstenProtocol extends BaseEthereumProtocol<AirGapNodeClient, EtherscanInfoClient> {
  constructor() {
    // we probably need another network here, explorer is ok
    super({
      chainID: 3,
      nodeClient: new AirGapNodeClient('https://ropsten.infura.io'),
      infoClient: new EtherscanInfoClient('https://api-ropsten.etherscan.io/')
    })
  }
}
