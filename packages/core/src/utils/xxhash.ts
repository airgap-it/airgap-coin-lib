import xxhash = require('../dependencies/src/xxhashjs-0.2.2/lib/index')

import { addHexPrefix, changeEndianness, isHex, toHexStringRaw } from './hex'

export function xxhashAsHex(
  data: string | Uint8Array | Buffer,
  bitLength: number,
  config: { littleEndian: boolean; withPrefix: boolean } = { littleEndian: true, withPrefix: false }
): string {
  const chunks = Math.ceil(bitLength / 64)
  const buffer = typeof data === 'string' && isHex(data) ? Buffer.from(data, 'hex') : Buffer.from(data as any)

  let hex = ''
  for (let seed = 0; seed < chunks; seed++) {
    const hash = toHexStringRaw(xxhash.h64(buffer, seed), 64)
    hex += config.littleEndian ? changeEndianness(hash) : hash
  }

  return config.withPrefix ? addHexPrefix(hex) : hex
}
