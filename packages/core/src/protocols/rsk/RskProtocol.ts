import { BaseRskProtocol } from './BaseRskProtocol'
import { RskExplorerInfoClient } from './clients/info-clients/RskExplorerInfoClient'
import { AirGapNodeClientRsk } from './clients/node-clients/AirGapNodeClientRsk'
import { RskProtocolOptions } from './RskProtocolOptions'

export class RskProtocol extends BaseRskProtocol<AirGapNodeClientRsk, RskExplorerInfoClient> {
  constructor(public readonly options: RskProtocolOptions = new RskProtocolOptions()) {
    super(options)
  }
}
