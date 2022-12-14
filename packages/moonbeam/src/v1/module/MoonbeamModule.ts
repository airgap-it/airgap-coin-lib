import { ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'

import { createMoonbeamSubscanBlockExplorer } from '../block-explorer/SubscanBlockExplorer'
import { MoonbeamBaseProtocol } from '../protocol/MoonbeamBaseProtocol'
import { createMoonbeamProtocol, MOONBEAM_MAINNET_PROTOCOL_NETWORK } from '../protocol/MoonbeamProtocol'

import { MoonbeamBaseModule } from './MoonbeamBaseModule'

export class MoonbeamModule extends MoonbeamBaseModule {
  protected readonly name: string = 'Moonbeam'

  public constructor() {
    super([MOONBEAM_MAINNET_PROTOCOL_NETWORK])
  }

  public createMoonbeamProtocol(network?: ProtocolNetwork | undefined): MoonbeamBaseProtocol {
    return createMoonbeamProtocol({ network })
  }

  public createMoonbeamBlockExplorer(network: ProtocolNetwork): BlockExplorer {
    return createMoonbeamSubscanBlockExplorer()
  }
}
