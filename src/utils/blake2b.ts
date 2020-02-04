import blake2b = require('../dependencies/src/blake2b-6268e6dd678661e0acc4359e9171b97eb1ebf8ac')
import { addHexPrefix } from './hex'

export function blake2bAsHex(data: Uint8Array | string, bitLength: number, config: { prefix: boolean } = { prefix: false }): string {
    const hash = blake2bAsBytes(data, bitLength)
    const hex = Buffer.from(hash).toString('hex')
    return config.prefix ? addHexPrefix(hex) : hex
}

export function blake2bAsBytes(data: Uint8Array | string, bitLength: number): Uint8Array {
    const byteLength = Math.ceil(bitLength / 8)
    const hashU8a = new Uint8Array(byteLength)

    const hash = blake2b(byteLength)
    hash.update(data)
    hash.digest(hashU8a)

    return hashU8a
}