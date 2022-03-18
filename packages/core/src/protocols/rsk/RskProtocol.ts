import { BaseRskProtocol } from './BaseRskProtocol'
import { RskExplorerInfoClient } from './clients/info-clients/RskExplorerInfoClient'
import { AirGapNodeClientRsk } from './clients/node-clients/AirGapNodeClientRsk'
import { RskProtocolOptions } from './RskProtocolOptions'

export class RskProtocol extends BaseRskProtocol<AirGapNodeClientRsk, RskExplorerInfoClient> {
  public supportsHD: boolean = true
  public standardDerivationPath: string = `m/44'/137'/0'/0/0`

  constructor(public readonly options: RskProtocolOptions = new RskProtocolOptions()) {
    super(options)
  }
}
