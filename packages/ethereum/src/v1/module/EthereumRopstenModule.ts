import { ProtocolNetwork } from '@airgap/module-kit'

import { EthereumBaseProtocol } from '../protocol/EthereumBaseProtocol'
import { createEthereumRopstenProtocol, ETHEREUM_ROPSTEN_MAINNET_PROTOCOL_NETWORK } from '../protocol/EthereumRopstenProtocol'

import { EthereumBaseModule } from './EthereumBaseModule'

export class EthereumRopstenModule extends EthereumBaseModule {
  public constructor() {
    super([ETHEREUM_ROPSTEN_MAINNET_PROTOCOL_NETWORK])
  }

  public createEthereumProtocol(network?: ProtocolNetwork | undefined): EthereumBaseProtocol {
    return createEthereumRopstenProtocol({ network })
  }
}
