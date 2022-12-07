import { ProtocolNetwork } from '../types/protocol'
import { protocolNetworkIdentifier } from '../utils/protocol'

export class ModuleNetworkRegistry {
  public readonly supportedNetworks: Record<string, ProtocolNetwork>
  private readonly defaultNetworkId: string | undefined

  public constructor(options: NetworkRegistryOptions) {
    this.supportedNetworks = options.supportedNetworks.reduce((obj: Record<string, ProtocolNetwork>, next: ProtocolNetwork) => {
      return Object.assign(obj, { [protocolNetworkIdentifier(next)]: next })
    }, {})

    const defaultNetwork: ProtocolNetwork | undefined = options.defaultNetwork ?? options.supportedNetworks[0]
    this.defaultNetworkId = defaultNetwork ? protocolNetworkIdentifier(defaultNetwork) : undefined
  }

  public findNetwork(networkId?: string): ProtocolNetwork | undefined {
    const targetNetworkId: string | undefined = networkId ?? this.defaultNetworkId

    return targetNetworkId ? this.supportedNetworks[targetNetworkId] : undefined
  }
}

export interface NetworkRegistryOptions {
  supportedNetworks: ProtocolNetwork[]
  defaultNetwork?: ProtocolNetwork
}
