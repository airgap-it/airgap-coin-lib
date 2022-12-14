import { ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'

import { createMoonbaseSubscanBlockExplorer } from '../block-explorer/SubscanBlockExplorer'
import { createMoonbaseProtocol, MOONBASE_MAINNET_PROTOCOL_NETWORK } from '../protocol/MoonbaseProtocol'
import { MoonbeamBaseProtocol } from '../protocol/MoonbeamBaseProtocol'

import { MoonbeamBaseModule } from './MoonbeamBaseModule'

export class MoonbaseModule extends MoonbeamBaseModule {
  protected readonly name: string = 'Moonbase'

  public constructor() {
    super([MOONBASE_MAINNET_PROTOCOL_NETWORK])
  }

  public createMoonbeamProtocol(network?: ProtocolNetwork | undefined): MoonbeamBaseProtocol {
    return createMoonbaseProtocol({ network })
  }

  public createMoonbeamBlockExplorer(network: ProtocolNetwork): BlockExplorer {
    return createMoonbaseSubscanBlockExplorer()
  }
}
