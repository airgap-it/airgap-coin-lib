import xxhash = require('xxhashjs')
import { changeEndianness, addHexPrefix, isHex } from './hex'
import { isString } from 'util'

export function xxhashAsHex(
  data: string | Uint8Array | Buffer,
  bitLength: number,
  config: { littleEndian: boolean; withPrefix: boolean } = { littleEndian: true, withPrefix: false }
): string {
  const chunks = Math.ceil(bitLength / 64)
  const buffer = isString(data) && isHex(data) ? Buffer.from(data, 'hex') : Buffer.from(data as any)

  let hex = ''
  for (let seed = 0; seed < chunks; seed++) {
    const hash = xxhash.h64(buffer, seed).toString(16)
    hex += config.littleEndian ? changeEndianness(hash) : hash
  }
  return config.withPrefix ? addHexPrefix(hex) : hex
}
