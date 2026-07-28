import { AxiosResponse, ResponseType } from '../../dependencies/src/axios-0.33.0/index'

import { RawData, RemoteData } from './RemoteData'
import { isPublicHttpUrl, remoteDataGet } from './remoteDataRequest'

export class HttpRemoteData<T> extends RemoteData<T> {
  public static from<T>(uri: string): HttpRemoteData<T> | undefined {
    return HttpRemoteData.validate(uri) ? new HttpRemoteData(uri) : undefined
  }

  public static validate(uri: string): boolean {
    return isPublicHttpUrl(uri)
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

    return await remoteDataGet<T>(this.uri, responseType)
  }
}
