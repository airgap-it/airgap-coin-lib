import { ProtocolNetwork } from '../types/protocol'
import { protocolNetworkIdentifier } from '../utils/protocol'

export class ModuleNetworkRegistry<_ProtocolNetwork extends ProtocolNetwork = ProtocolNetwork> {
  public readonly supportedNetworks: Record<string, _ProtocolNetwork>
  private readonly defaultNetworkId: string | undefined

  public constructor(options: NetworkRegistryOptions<_ProtocolNetwork>) {
    this.supportedNetworks = options.supportedNetworks.reduce((obj: Record<string, _ProtocolNetwork>, next: _ProtocolNetwork) => {
      return Object.assign(obj, { [protocolNetworkIdentifier(next)]: next })
    }, {})

    const defaultNetwork: _ProtocolNetwork | undefined = options.defaultNetwork ?? options.supportedNetworks[0]
    this.defaultNetworkId = defaultNetwork ? protocolNetworkIdentifier(defaultNetwork) : undefined
  }

  public findNetwork(networkId?: string): _ProtocolNetwork | undefined {
    const targetNetworkId: string | undefined = networkId ?? this.defaultNetworkId

    return targetNetworkId ? this.supportedNetworks[targetNetworkId] : undefined
  }
}

export interface NetworkRegistryOptions<_ProtocolNetwork extends ProtocolNetwork = ProtocolNetwork> {
  supportedNetworks: _ProtocolNetwork[]
  defaultNetwork?: _ProtocolNetwork
}
