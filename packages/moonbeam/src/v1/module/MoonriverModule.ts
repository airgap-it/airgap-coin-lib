import { ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'

import { createMoonriverSubscanBlockExplorer } from '../block-explorer/SubscanBlockExplorer'
import { MoonbeamBaseProtocol } from '../protocol/MoonbeamBaseProtocol'
import { createMoonriverProtocol, MOONRIVER_MAINNET_PROTOCOL_NETWORK } from '../protocol/MoonriverProtocol'

import { MoonbeamBaseModule } from './MoonbeamBaseModule'

export class MoonriverModule extends MoonbeamBaseModule {
  protected readonly name: string = 'Moonriver'

  public constructor() {
    super([MOONRIVER_MAINNET_PROTOCOL_NETWORK])
  }

  public createMoonbeamProtocol(network?: ProtocolNetwork | undefined): MoonbeamBaseProtocol {
    return createMoonriverProtocol({ network })
  }

  public createMoonbeamBlockExplorer(network: ProtocolNetwork): BlockExplorer {
    return createMoonriverSubscanBlockExplorer()
  }
}
