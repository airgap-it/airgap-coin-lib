import { ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { createAstarSubscanBlockExplorer } from '../block-explorer/SubscanBlockExplorer'
import { AstarBaseProtocol } from '../protocol/AstarBaseProtocol'
import { ASTAR_MAINNET_PROTOCOL_NETWORK, createAstarProtocol } from '../protocol/AstarProtocol'
import { AstarBaseModule } from './AstarBaseModule'

export class AstarModule extends AstarBaseModule {
  protected readonly name: string = 'Astar'

  public constructor() {
    super([ASTAR_MAINNET_PROTOCOL_NETWORK])
  }

  public createAstarProtocol(network?: ProtocolNetwork | undefined): AstarBaseProtocol {
    return createAstarProtocol({ network })
  }

  public createAstarBlockExplorer(network: ProtocolNetwork): BlockExplorer {
    return createAstarSubscanBlockExplorer()
  }
}
