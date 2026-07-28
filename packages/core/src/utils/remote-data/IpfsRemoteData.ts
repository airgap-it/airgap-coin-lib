// https://github.com/ipfs/in-web-browsers/blob/master/ADDRESSING.md

import { AxiosResponse, ResponseType } from '../../dependencies/src/axios-0.33.0/index'

import { RawData, RemoteData } from './RemoteData'
import { remoteDataGet } from './remoteDataRequest'

const IPFS_SCHEME = 'ipfs'
const IPFS_HTTP_GATEWAY = 'https://dweb.link/ipfs'

const IPNS_SCHEME = 'ipns'
const IPNS_HTTP_GATEWAY = 'https://dweb.link/ipns'

function http(uri: string): string | undefined {
  if (uri.startsWith(IPFS_SCHEME)) {
    return ipfs(uri)
  } else if (uri.startsWith(IPNS_SCHEME)) {
    return ipns(uri)
  } else {
    return undefined
  }
}

// the CID and path come from an untrusted source, so they must not be able to escape the gateway
// prefix (e.g. by injecting a query, fragment or `..` segment)
function gatewayPath(uri: string, scheme: string): string {
  return uri
    .replace(`${scheme}://`, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function ipfs(uri: string): string {
  return `${IPFS_HTTP_GATEWAY}/${gatewayPath(uri, IPFS_SCHEME)}`
}

function ipns(uri: string): string {
  return `${IPNS_HTTP_GATEWAY}/${gatewayPath(uri, IPNS_SCHEME)}`
}

export class IpfsRemoteData<T> extends RemoteData<T> {
  public static from<T>(uri: string): IpfsRemoteData<T> | undefined {
    return IpfsRemoteData.validate(uri) ? new IpfsRemoteData(uri) : undefined
  }

  public static validate(uri: string): boolean {
    return uri.startsWith(IPFS_SCHEME) || uri.startsWith(IPNS_SCHEME)
  }

  public async get(): Promise<T | undefined> {
    const response: AxiosResponse<T> | undefined = await this.getData()
    return response?.data
  }

  public async getRaw(): Promise<RawData | undefined> {
    const response: AxiosResponse<ArrayBuffer> | undefined = await this.getData('arraybuffer')
    return response ? { bytes: Buffer.from(response.data), contentType: response.headers['content-type'] } : undefined
  }

  private async getData<T>(responseType: ResponseType = 'json'): Promise<AxiosResponse<T> | undefined> {
    if (!IpfsRemoteData.validate(this.uri)) {
      return undefined
    }

    const uri = http(this.uri)
    if (!uri) {
      return undefined
    }

    return await remoteDataGet<T>(uri, responseType)
  }
}
