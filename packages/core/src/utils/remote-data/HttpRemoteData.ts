import axios, { AxiosResponse } from '../../dependencies/src/axios-0.19.0/index'

import { RemoteData } from './RemoteData'

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
    if (!HttpRemoteData.validate(this.uri)) {
      return undefined
    }

    const response: AxiosResponse<T> = await axios.get(this.uri)
    return response.data
  }
}
