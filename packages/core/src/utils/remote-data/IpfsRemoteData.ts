// https://github.com/ipfs/in-web-browsers/blob/master/ADDRESSING.md

import axios, { AxiosResponse, ResponseType } from '../../dependencies/src/axios-0.19.0/index'

import { RawData, RemoteData } from './RemoteData'

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

function ipfs(uri: string): string {
  return `${IPFS_HTTP_GATEWAY}/${uri.replace(`${IPFS_SCHEME}://`, '')}`
}

function ipns(uri: string): string {
  return `${IPNS_HTTP_GATEWAY}/${uri.replace(`${IPNS_SCHEME}://`, '')}`
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

    return await axios.get(uri, { responseType })
  }
}
