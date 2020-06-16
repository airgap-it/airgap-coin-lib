import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { ChainNetwork } from '../../utils/Network'

export class EthereumProtocol extends BaseEthereumProtocol<AirGapNodeClient, EtherscanInfoClient> {
  constructor(config?: { chainNetwork: ChainNetwork }) {
    super({
      chainNetwork: config?.chainNetwork,
      configuration: {
        chainID: 1,
        nodeClient: new AirGapNodeClient(),
        infoClient: new EtherscanInfoClient()
      }
    })
  }
}
