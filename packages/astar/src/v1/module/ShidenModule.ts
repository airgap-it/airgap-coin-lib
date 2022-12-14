import { ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { createShidenSubscanBlockExplorer } from '../block-explorer/SubscanBlockExplorer'
import { AstarBaseProtocol } from '../protocol/AstarBaseProtocol'
import { createShidenProtocol, SHIDEN_MAINNET_PROTOCOL_NETWORK } from '../protocol/ShidenProtocol'
import { AstarBaseModule } from './AstarBaseModule'

export class ShidenModule extends AstarBaseModule {
  protected readonly name: string = 'Shiden'

  public constructor() {
    super([SHIDEN_MAINNET_PROTOCOL_NETWORK])
  }

  public createAstarProtocol(network?: ProtocolNetwork | undefined): AstarBaseProtocol {
    return createShidenProtocol({ network })
  }

  public createAstarBlockExplorer(network: ProtocolNetwork): BlockExplorer {
    return createShidenSubscanBlockExplorer()
  }
}
