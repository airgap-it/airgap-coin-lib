import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EtherscanInfoClient } from './clients/info-clients/EtherscanInfoClient'
import { AirGapNodeClient } from './clients/node-clients/AirGapNodeClient'
import { EthereumProtocolOptions } from './EthereumProtocolOptions'

export class EthereumProtocol extends BaseEthereumProtocol<AirGapNodeClient, EtherscanInfoClient> {
  public supportsHD: boolean = true
  public standardDerivationPath: string = `m/44'/60'/0'`

  constructor(public readonly options: EthereumProtocolOptions = new EthereumProtocolOptions()) {
    super(options)
  }
}
