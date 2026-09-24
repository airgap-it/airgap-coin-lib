'use strict'

import base58 from 'bs58'

export default function (checksumFn: (payload: Uint8Array | string) => Uint8Array): {
  encode: (payload: Uint8Array | number[]) => string
  decode: (str: string) => Uint8Array
  decodeUnsafe: (str: string) => Uint8Array | undefined
} {
  // Encode a buffer as a base58-check encoded string
  function encode (payload: Uint8Array | number[]): string {
    const payloadU8 = Uint8Array.from(payload)
    const checksum = checksumFn(payloadU8)
    const length = payloadU8.length + 4
    const both = new Uint8Array(length)
    both.set(payloadU8, 0)
    both.set(checksum.subarray(0, 4), payloadU8.length)
    return base58.encode(both)
  }

  function decodeRaw (buffer: Uint8Array): Uint8Array | undefined {
    const payload = buffer.slice(0, -4)
    const checksum = buffer.slice(-4)
    const newChecksum = checksumFn(payload)

    // eslint-disable-next-line
    if (checksum[0] ^ newChecksum[0] |
        checksum[1] ^ newChecksum[1] |
        checksum[2] ^ newChecksum[2] |
        checksum[3] ^ newChecksum[3]) return

    return payload
  }

  // Decode a base58-check encoded string to a buffer, no result if checksum is wrong
  function decodeUnsafe (str: string): Uint8Array | undefined {
    const buffer = base58.decodeUnsafe(str)
    if (buffer == null) return

    return decodeRaw(buffer)
  }

  function decode (str: string): Uint8Array {
    const buffer = base58.decode(str)
    const payload = decodeRaw(buffer)
    if (payload == null) throw new Error('Invalid checksum')
    return payload
  }

  return {
    encode,
    decode,
    decodeUnsafe
  }
}
