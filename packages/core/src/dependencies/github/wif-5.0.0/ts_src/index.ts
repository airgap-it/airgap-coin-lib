import bs58Check from 'bs58check'

export interface WIF {
  version: number
  privateKey: Uint8Array
  compressed: boolean
}

export function decodeRaw (buffer: Uint8Array, version?: number): WIF {
  // check version only if defined
  if (version !== undefined && buffer[0] !== version) throw new Error('Invalid network version')

  // uncompressed
  if (buffer.length === 33) {
    return {
      version: buffer[0],
      privateKey: buffer.slice(1, 33),
      compressed: false
    }
  }

  // invalid length
  if (buffer.length !== 34) throw new Error('Invalid WIF length')

  // invalid compression flag
  if (buffer[33] !== 0x01) throw new Error('Invalid compression flag')

  return {
    version: buffer[0],
    privateKey: buffer.slice(1, 33),
    compressed: true
  }
}

export function encodeRaw (version: number, privateKey: Uint8Array, compressed: boolean): Uint8Array {
  if (privateKey.length !== 32) throw new TypeError('Invalid privateKey length')

  const result = new Uint8Array(compressed ? 34 : 33)
  const view = new DataView(result.buffer)
  view.setUint8(0, version)
  result.set(privateKey, 1)

  if (compressed) {
    result[33] = 0x01
  }

  return result
}

export function decode (str: string, version?: number): WIF {
  return decodeRaw(bs58Check.decode(str), version)
}

export function encode (wif: WIF): string {
  return bs58Check.encode(
    encodeRaw(
      wif.version,
      wif.privateKey,
      wif.compressed
    )
  )
}
