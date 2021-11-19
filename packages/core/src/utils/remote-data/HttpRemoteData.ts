import axios, { AxiosResponse, ResponseType } from '../../dependencies/src/axios-0.19.0/index'

import { RawData, RemoteData } from './RemoteData'

const HTTP_SCHEME = 'http'
const HTTPS_SCHEME = 'https'

export class HttpRemoteData<T> extends RemoteData<T> {
  public static from<T>(uri: string): HttpRemoteData<T> | undefined {
    return HttpRemoteData.validate(uri) ? new HttpRemoteData(uri) : undefined
  }

  public static validate(uri: string): boolean {
    return uri.startsWith(HTTP_SCHEME) || uri.startsWith(HTTPS_SCHEME)
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
    if (!HttpRemoteData.validate(this.uri)) {
      return undefined
    }

    return await axios.get(this.uri, { responseType })
  }
}
