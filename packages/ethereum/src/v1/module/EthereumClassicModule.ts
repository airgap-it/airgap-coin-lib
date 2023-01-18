import { ProtocolNetwork } from '@airgap/module-kit'

import { EthereumBaseProtocol } from '../protocol/EthereumBaseProtocol'
import { createEthereumClassicProtocol, ETHEREUM_CLASSIC_MAINNET_PROTOCOL_NETWORK } from '../protocol/EthereumClassicProtocol'

import { EthereumBaseModule } from './EthereumBaseModule'

export class EthereumClassicModule extends EthereumBaseModule {
  public constructor() {
    super([ETHEREUM_CLASSIC_MAINNET_PROTOCOL_NETWORK])
  }

  public createEthereumProtocol(network?: ProtocolNetwork | undefined): EthereumBaseProtocol {
    return createEthereumClassicProtocol({ network })
  }
}
