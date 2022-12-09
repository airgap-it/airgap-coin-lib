import { ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { createPolkadotSubscanBlockExplorer } from '../block-explorer/SubscanBlockExplorer'
import { PolkadotBaseProtocol } from '../protocol/PolkadotBaseProtocol'
import { createPolkadotProtocol, POLKADOT_MAINNET_PROTOCOL_NETWORK } from '../protocol/PolkadotProtocol'
import { PolkadotBaseModule } from './PolkadotBaseModule'

export class PolkadotModule extends PolkadotBaseModule {
  protected readonly name: string = 'Polkadot'

  public constructor() {
    super([POLKADOT_MAINNET_PROTOCOL_NETWORK])
  }

  public createPolkadotProtocol(network?: ProtocolNetwork | undefined): PolkadotBaseProtocol {
    return createPolkadotProtocol({ network })
  }

  public createPolkadotBlockExplorer(network: ProtocolNetwork): BlockExplorer {
    return createPolkadotSubscanBlockExplorer()
  }
}
