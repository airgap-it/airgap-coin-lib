import { NetworkType } from '../../utils/ProtocolNetwork'
import { BaseRskProtocol } from './BaseRskProtocol'
import { RskExplorerInfoClient } from './clients/info-clients/RskExplorerInfoClient'
import { AirGapNodeClientRsk } from './clients/node-clients/AirGapNodeClientRsk'
import { RskExplorerBlockExplorer, RskProtocolNetwork, RskProtocolNetworkExtras, RskProtocolOptions } from './RskProtocolOptions'

export class RskTestnetProtocol extends BaseRskProtocol<AirGapNodeClientRsk, RskExplorerInfoClient> {
  constructor() {
    // we probably need another network here, explorer is ok
    super(
      new RskProtocolOptions(
        new RskProtocolNetwork(
          'RSK Testnet',
          NetworkType.TESTNET,
          'https://public-node.testnet.rsk.co',
          new RskExplorerBlockExplorer('https://explorer-testnet.rsk.co'),
          new RskProtocolNetworkExtras(31, 'https://backend.explorer.testnet.rsk.co') // TODO: Api url format is different than blockscout.com!
        )
      )
    )
  }
}
