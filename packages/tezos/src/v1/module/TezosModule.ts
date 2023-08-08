import { Domain, MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import {
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolNetwork
} from '@airgap/module-kit'

import { createTezosBlockExplorer } from '../block-explorer/factory'
import { createTetherUSDProtocol } from '../module'
import { createBTCTezProtocol } from '../protocol/fa/tokens/BTCTezProtocol'
import { createCTezProtocol } from '../protocol/fa/tokens/CTezProtocol'
import { createDogamiProtocol } from '../protocol/fa/tokens/DogamiProtocol'
import { createETHTezProtocol } from '../protocol/fa/tokens/ETHTezProtocol'
import { createKolibriUSDProtocol } from '../protocol/fa/tokens/KolibriUSDProtocol'
import { createPlentyProtocol } from '../protocol/fa/tokens/PlentyProtocol'
import { createQuipuswapProtocol } from '../protocol/fa/tokens/QuipuswapProtocol'
import { createSiriusProtocol } from '../protocol/fa/tokens/SiriusProtocol'
import { createStakerProtocol } from '../protocol/fa/tokens/StakerProtocol'
import { createTzBTCProtocol } from '../protocol/fa/tokens/TzBTCProtocol'
import { createUBTCProtocol } from '../protocol/fa/tokens/UBTCProtocol'
import { createUXTZProtocol } from '../protocol/fa/tokens/UXTZProtocol'
import { createUDEFIProtocol } from '../protocol/fa/tokens/UDEFIProtocol'
import { createUSDTezProtocol } from '../protocol/fa/tokens/USDTezProtocol'
import { createUUSDProtocol } from '../protocol/fa/tokens/UUSDProtocol'
import { createWrappedTezosProtocol } from '../protocol/fa/tokens/WrappedTezosProtocol'
import { createWrapProtocol } from '../protocol/fa/tokens/WrapProtocol'
import { createYouProtocol } from '../protocol/fa/tokens/YouProtocol'
import { createTezosKtProtocol } from '../protocol/kt/TezosKtProtocol'
import { createTezosShieldedTezProtocol } from '../protocol/sapling/TezosShieldedTezProtocol'
import { createTezosProtocol, TEZOS_GHOSTNET_PROTOCOL_NETWORK, TEZOS_MAINNET_PROTOCOL_NETWORK } from '../protocol/TezosProtocol'
import { TezosV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { TezosProtocolNetwork } from '../types/protocol'

export class TezosModule implements AirGapModule<{ ProtocolNetwork: TezosProtocolNetwork }> {
  private readonly networkRegistries: Record<string, ModuleNetworkRegistry<TezosProtocolNetwork>>
  public readonly supportedProtocols: Record<string, ProtocolConfiguration>

  public constructor() {
    const supportedFAProtocols: ProtocolSymbols[] = [
      SubProtocolSymbols.XTZ_BTC,
      SubProtocolSymbols.XTZ_USD,
      SubProtocolSymbols.XTZ_KUSD,
      SubProtocolSymbols.XTZ_STKR,
      SubProtocolSymbols.XTZ_ETHTZ,
      SubProtocolSymbols.XTZ_UUSD,
      SubProtocolSymbols.XTZ_YOU,
      SubProtocolSymbols.XTZ_W,
      SubProtocolSymbols.XTZ_UDEFI,
      SubProtocolSymbols.XTZ_UBTC,
      SubProtocolSymbols.XTZ_UXTZ,
      SubProtocolSymbols.XTZ_CTEZ,
      SubProtocolSymbols.XTZ_PLENTY,
      SubProtocolSymbols.XTZ_WRAP,
      SubProtocolSymbols.XTZ_QUIPU,
      SubProtocolSymbols.XTZ_DOGA,
      SubProtocolSymbols.XTZ_BTC_TEZ,
      SubProtocolSymbols.XTZ_USDT,
      SubProtocolSymbols.XTZ_SIRS
    ]

    const tezosNetworkRegistry: ModuleNetworkRegistry<TezosProtocolNetwork> = new ModuleNetworkRegistry({
      supportedNetworks: [TEZOS_MAINNET_PROTOCOL_NETWORK, TEZOS_GHOSTNET_PROTOCOL_NETWORK]
    })

    this.networkRegistries = {
      [MainProtocolSymbols.XTZ]: tezosNetworkRegistry,
      [MainProtocolSymbols.XTZ_SHIELDED]: tezosNetworkRegistry,
      [SubProtocolSymbols.XTZ_KT]: new ModuleNetworkRegistry({
        supportedNetworks: [TEZOS_MAINNET_PROTOCOL_NETWORK]
      }),
      ...supportedFAProtocols.reduce(
        (obj: Record<string, ModuleNetworkRegistry>, next: ProtocolSymbols) => Object.assign(obj, { [next]: tezosNetworkRegistry }),
        {}
      )
    }
    this.supportedProtocols = createSupportedProtocols(this.networkRegistries)
  }

  public async createOfflineProtocol(identifier: string): Promise<AirGapOfflineProtocol | undefined> {
    return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
    identifier: string,
    networkOrId?: TezosProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
    const network: TezosProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.TEZOS, 'Protocol network type not supported.')
    }

    return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
    identifier: string,
    networkOrId?: TezosProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
    const network: TezosProtocolNetwork | undefined =
      typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

    if (network === undefined) {
      throw new ConditionViolationError(Domain.TEZOS, 'Block Explorer network type not supported.')
    }

    return createTezosBlockExplorer(network.blockExplorerType, network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
    return new TezosV3SerializerCompanion()
  }

  // tslint:disable-next-line: cyclomatic-complexity
  private createProtocol(identifier: string, network?: ProtocolNetwork): AirGapProtocol {
    // TODO: should we allow to create generic FA tokens here?
    switch (identifier) {
      case MainProtocolSymbols.XTZ:
        return createTezosProtocol({ network })
      case MainProtocolSymbols.XTZ_SHIELDED:
        return createTezosShieldedTezProtocol({ network })
      case SubProtocolSymbols.XTZ_KT:
        return createTezosKtProtocol({ network })
      case SubProtocolSymbols.XTZ_BTC:
        return createTzBTCProtocol({ network })
      case SubProtocolSymbols.XTZ_USD:
        return createUSDTezProtocol({ network })
      case SubProtocolSymbols.XTZ_KUSD:
        return createKolibriUSDProtocol({ network })
      case SubProtocolSymbols.XTZ_USDT:
        return createTetherUSDProtocol({ network })
      case SubProtocolSymbols.XTZ_STKR:
        return createStakerProtocol({ network })
      case SubProtocolSymbols.XTZ_ETHTZ:
        return createETHTezProtocol({ network })
      case SubProtocolSymbols.XTZ_UUSD:
        return createUUSDProtocol({ network })
      case SubProtocolSymbols.XTZ_YOU:
        return createYouProtocol({ network })
      case SubProtocolSymbols.XTZ_W:
        return createWrappedTezosProtocol({ network })
      case SubProtocolSymbols.XTZ_UDEFI:
        return createUDEFIProtocol({ network })
      case SubProtocolSymbols.XTZ_UBTC:
        return createUBTCProtocol({ network })
      case SubProtocolSymbols.XTZ_UXTZ:
        return createUXTZProtocol({ network })
      case SubProtocolSymbols.XTZ_CTEZ:
        return createCTezProtocol({ network })
      case SubProtocolSymbols.XTZ_PLENTY:
        return createPlentyProtocol({ network })
      case SubProtocolSymbols.XTZ_WRAP:
        return createWrapProtocol({ network })
      case SubProtocolSymbols.XTZ_QUIPU:
        return createQuipuswapProtocol({ network })
      case SubProtocolSymbols.XTZ_DOGA:
        return createDogamiProtocol({ network })
      case SubProtocolSymbols.XTZ_BTC_TEZ:
        return createBTCTezProtocol({ network })
      case SubProtocolSymbols.XTZ_USDT:
        return createUSDTezProtocol({ network })
      case SubProtocolSymbols.XTZ_SIRS:
        return createSiriusProtocol({ network })
      default:
        throw new ConditionViolationError(Domain.TEZOS, `Protocol ${identifier} not supported.`)
    }
  }
}
