import { AxiosResponse } from '../../dependencies/src/axios-0.33.0/index'
import sha = require('../../dependencies/src/sha.js-2.4.12/index')
import { stripHexPrefix } from '../hex'

import { RawData, RemoteData } from './RemoteData'
import { isPublicHttpUrl, remoteDataGet } from './remoteDataRequest'

const SHA256_SCHEME = 'sha256'

function parseUri(uri: string): { hash?: string; path?: string } {
  const [hash, path] = uri.replace(`${SHA256_SCHEME}://`, '').split(/\/(.+)/, 2)

  return { hash, path }
}

export class Sha256RemoteData<T> extends RemoteData<T> {
  protected constructor(
    uri: string,
    private readonly hash: Buffer,
    private readonly path: string
  ) {
    super(uri)
  }

  public static from<T>(uri: string): Sha256RemoteData<T> | undefined {
    if (!Sha256RemoteData.validate(uri)) {
      return undefined
    }

    const { hash, path } = parseUri(uri)
    if (!hash || !path) {
      return undefined
    }

    return new Sha256RemoteData(uri, Buffer.from(stripHexPrefix(hash), 'hex'), decodeURIComponent(path))
  }

  public static validate(uri: string): boolean {
    if (!uri.startsWith(SHA256_SCHEME)) {
      return false
    }

    const { hash, path } = parseUri(uri)

    const validHash = !!hash && hash.startsWith('0x')
    // the path is an arbitrary URL taken from an untrusted source, so it has to clear the same bar
    // as any other remote data target
    const validPath = !!path && isPublicHttpUrl(decodeURIComponent(path))

    return validHash && validPath
  }

  public async get(): Promise<T | undefined> {
    const data: RawData | undefined = await this.getRaw()
    if (data === undefined) {
      return undefined
    }

    const decoder = new TextDecoder()
    return JSON.parse(decoder.decode(data.bytes.buffer))
  }

  public async getRaw(): Promise<RawData | undefined> {
    if (!Sha256RemoteData.validate(this.uri)) {
      return undefined
    }

    const response: AxiosResponse<ArrayBuffer> = await remoteDataGet<ArrayBuffer>(this.path, 'arraybuffer')
    const data: ArrayBuffer = response.data
    const hash: Buffer = sha('sha256').update(data).digest()
    if (!this.hash.equals(hash)) {
      return undefined
    }

    return {
      bytes: Buffer.from(data),
      contentType: response.headers['content-type']
    }
  }
}
