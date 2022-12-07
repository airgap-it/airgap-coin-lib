import { Domain } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
import { AirGapModule, ModuleNetworkRegistry, ProtocolNetwork } from '@airgap/module-kit'
import { BlockExplorer } from '@airgap/module-kit/block-explorer/block-explorer'
import { OfflineProtocol, OnlineProtocol } from '@airgap/module-kit/protocol/protocol'
import { CRYPTOID_TESTNET_URL, CryptoIDBlockExplorer } from '../block-explorer/CryptoIDBlockExplorer'
import {
  createGroestlcoinProtocol,
  GROESTLCOIN_MAINNET_PROTOCOL_NETWORK,
  GROESTLCOIN_TESTNET_PROTOCOL_NETWORK
} from '../protocol/GroestlcoinProtocol'

export class GroestlcoinModule implements AirGapModule {
  private readonly networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
    supportedNetworks: [GROESTLCOIN_MAINNET_PROTOCOL_NETWORK, GROESTLCOIN_TESTNET_PROTOCOL_NETWORK]
  })

  public supportedNetworks: Record<string, ProtocolNetwork> = this.networkRegistry.supportedNetworks

  public async createOfflineProtocol(): Promise<OfflineProtocol<{}> | undefined> {
    return createGroestlcoinProtocol()
  }

  public async createOnlineProtocol(networkId?: string | undefined): Promise<OnlineProtocol | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.GROESTLCOIN, 'Protocol network type not supported.')
    }

    return createGroestlcoinProtocol({ network })
  }

  public async createBlockExplorer(networkId?: string | undefined): Promise<BlockExplorer | undefined> {
    const network: ProtocolNetwork | undefined = this.networkRegistry.findNetwork(networkId)
    if (network === undefined) {
      throw new ConditionViolationError(Domain.GROESTLCOIN, 'Block Explorer network type not supported.')
    }

    if (network.type === 'testnet') {
      return new CryptoIDBlockExplorer(CRYPTOID_TESTNET_URL)
    } else {
      return new CryptoIDBlockExplorer()
    }
  }
}
