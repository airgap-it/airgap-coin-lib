import { AirGapBlockExplorer, ProtocolNetwork } from '@airgap/module-kit'

import { createKusamaSubscanBlockExplorer } from '../block-explorer/SubscanBlockExplorer'
import { createKusamaProtocol, KUSAMA_MAINNET_PROTOCOL_NETWORK } from '../protocol/KusamaProtocol'
import { PolkadotBaseProtocol } from '../protocol/PolkadotBaseProtocol'

import { PolkadotBaseModule } from './PolkadotBaseModule'

export class KusamaModule extends PolkadotBaseModule {
  protected readonly name: string = 'Kusama'

  public constructor() {
    super([KUSAMA_MAINNET_PROTOCOL_NETWORK])
  }

  public createPolkadotProtocol(network?: ProtocolNetwork | undefined): PolkadotBaseProtocol {
    return createKusamaProtocol({ network })
  }

  public createPolkadotBlockExplorer(network: ProtocolNetwork): AirGapBlockExplorer {
    return createKusamaSubscanBlockExplorer()
  }
}
