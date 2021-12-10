import { RawData, RemoteData } from '../../../../utils/remote-data/RemoteData'
import { TezosNetwork } from '../../TezosProtocol'
import { TezosProtocolNetworkResolver } from '../../TezosProtocolOptions'
import { MichelsonBytes } from '../../types/michelson/primitives/MichelsonBytes'
import { TezosContract } from '../TezosContract'

const TEZOS_STORAGE_SCHEME = 'tezos-storage'

function parseUri(uri: string): { address?: string; network?: string; path?: string } {
  const schemeRegex = new RegExp(`${TEZOS_STORAGE_SCHEME}:(//)?`)
  const [hostOrPath, pathOrUndefined] = uri.replace(schemeRegex, '').split(/\/(.+)/, 2)
  if (!pathOrUndefined) {
    return { address: undefined, network: undefined, path: hostOrPath }
  } else {
    const [address, network] = hostOrPath?.split(/\.(.+)/, 2)
    return { address, network, path: pathOrUndefined }
  }
}

function findHostContract(
  contract: TezosContract,
  networkResolver?: TezosProtocolNetworkResolver,
  address?: string,
  network?: string
): TezosContract | undefined {
  if ((address && address !== contract.address) || (network && network !== contract.network.extras.network)) {
    const protocolNetwork = network && networkResolver ? networkResolver(network) : undefined
    if (network && !protocolNetwork) {
      return undefined
    }

    return contract.copy({
      address,
      network: protocolNetwork
    })
  } else if (address && address !== contract.address) {
    return contract.copy({ address })
  } else {
    return contract
  }
}

export class TezosStorageRemoteData<T> extends RemoteData<T> {
  private constructor(uri: string, private readonly contract: TezosContract, private readonly key: string) {
    super(uri)
  }

  public static create<T>(
    uri: string,
    contract: TezosContract,
    networkResolver?: TezosProtocolNetworkResolver
  ): TezosStorageRemoteData<T> | undefined {
    if (!TezosStorageRemoteData.validate(uri)) {
      return undefined
    }

    const { address, network, path } = parseUri(uri)
    if (!path) {
      return undefined
    }

    const hostContract = findHostContract(contract, networkResolver, address, network)

    return hostContract ? new TezosStorageRemoteData(uri, hostContract, decodeURIComponent(path)) : undefined
  }

  public static validate(uri: string): boolean {
    if (!uri.startsWith(TEZOS_STORAGE_SCHEME)) {
      return false
    }

    const { address, network, path } = parseUri(uri)
    const tezosNetworks: string[] = Object.values(TezosNetwork)

    const validAddress = !address || address.startsWith('KT1')
    const validNetwork = !network || network.startsWith('Nat') || tezosNetworks.includes(network)
    const validPath = !!path && !path.includes('/')

    return validAddress && validNetwork && validPath
  }

  public async get(): Promise<T | undefined> {
    const data: RawData | undefined = await this.getRaw()

    return data ? JSON.parse(data.bytes.toString()) : undefined
  }

  public async getRaw(): Promise<RawData | undefined> {
    const bigMapID = await this.contract.findBigMap('metadata')
    if (bigMapID === undefined) {
      return undefined
    }

    const contentResponse = await this.contract.bigMapValue(bigMapID, this.key, { prim: 'string' }, { prim: 'bytes' })

    return contentResponse ? { bytes: (contentResponse as MichelsonBytes)?.value } : undefined
  }
}
