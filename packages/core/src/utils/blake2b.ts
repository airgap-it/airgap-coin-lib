// Uses @stablelib/blake2b rather than the vendored BitGo blake2b: the BitGo repository has been
// deleted upstream (both BitGo/blake2b and BitGo/blake2b-wasm now 404), so that copy can no longer
// be re-vendored, diffed against upstream, or receive fixes. @stablelib is actively maintained and
// already vendored here. Output was verified byte-identical for keyed and unkeyed digests at the
// 128- and 256-bit lengths this wrapper is called with.
import { BLAKE2b } from '../dependencies/src/@stablelib/blake2b-1.0.1/packages/blake2b/blake2b'

import { addHexPrefix, hexToBytes } from './hex'

export function blake2bAsHex(
  data: Uint8Array | string,
  bitLength: number,
  config: { withPrefix: boolean; key?: Uint8Array } = { withPrefix: false }
): string {
  const hash = blake2bAsBytes(data, bitLength, { key: config.key })
  const hex = Buffer.from(hash).toString('hex')

  return config.withPrefix ? addHexPrefix(hex) : hex
}

export function blake2bAsBytes(data: Uint8Array | string, bitLength: number, config: { key?: Uint8Array } = {}): Uint8Array {
  const byteLength = Math.ceil(bitLength / 8)

  const hash = new BLAKE2b(byteLength, config.key !== undefined ? { key: config.key } : undefined)
  hash.update(hexToBytes(data))

  return hash.digest()
}
