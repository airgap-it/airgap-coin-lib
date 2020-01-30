import blake2b = require('../dependencies/src/blake2b-6268e6dd678661e0acc4359e9171b97eb1ebf8ac')
import { addHexPrefix } from './hex'

export function blake2bAsHex(data: string, bitLength: number): string {
    return addHexPrefix(blake2bAsRaw(data, bitLength))
}

export function blake2bAsRaw(data: Uint8Array | string, bitLength: number): string {
    const byteLength = Math.ceil(bitLength / 8)
    const hashU8a = new Uint8Array(byteLength)

    const hash = blake2b(byteLength)
    hash.update(data)
    hash.digest(hashU8a)

    return Buffer.from(hashU8a).toString('hex')
}