import { ProtocolNetwork } from '@airgap/module-kit'

import { EthereumBaseProtocol } from '../protocol/EthereumBaseProtocol'
import { createEthereumProtocol, ETHEREUM_MAINNET_PROTOCOL_NETWORK } from '../protocol/EthereumProtocol'

import { EthereumBaseModule } from './EthereumBaseModule'

export class EthereumModule extends EthereumBaseModule {
  public constructor() {
    super([ETHEREUM_MAINNET_PROTOCOL_NETWORK])
  }

  public createEthereumProtocol(network?: ProtocolNetwork | undefined): EthereumBaseProtocol {
    return createEthereumProtocol({ network })
  }
}
