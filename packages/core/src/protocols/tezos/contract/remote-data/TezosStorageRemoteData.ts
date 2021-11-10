import { RawData, RemoteData } from '../../../../utils/remote-data/RemoteData'
import { TezosNetwork } from '../../TezosProtocol'
import { indexerApi, indexerNetwork, nodeUrl } from '../../TezosProtocolOptions'
import { TezosUtils } from '../../TezosUtils'
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

function findHostContract(contract: TezosContract, address?: string, network?: string): TezosContract | undefined {
  if ((address && address !== contract.address) || (network && network !== contract.network)) {
    const tezosNetwork = network ? TezosUtils.resolveNetwork(network) : undefined
    if (network && !tezosNetwork) {
      return undefined
    }

    return contract.copy({
      address,
      network: tezosNetwork,
      nodeRPCURL: tezosNetwork ? nodeUrl(tezosNetwork) : undefined,
      conseilAPIURL: tezosNetwork ? indexerApi(tezosNetwork) : undefined,
      conseilNetwork: tezosNetwork ? indexerNetwork(tezosNetwork) : undefined
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

  public static create<T>(uri: string, contract: TezosContract): TezosStorageRemoteData<T> | undefined {
    if (!TezosStorageRemoteData.validate(uri)) {
      return undefined
    }

    const { address, network, path } = parseUri(uri)
    if (!path) {
      return undefined
    }

    const hostContract = findHostContract(contract, address, network)
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
