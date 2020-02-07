import bs58 = require('../../../dependencies/src/bs58-4.0.1')

import { isHex, stripHexPrefix } from "../../../utils/hex"
import { blake2bAsBytes } from '../../../utils/blake2b'
import { isString } from 'util'

/*
 * Polkadot: 0, 1
 * Kusama: 2, 3
 * Dothereum: 20
 * Substrate: 42, 43
 */
const SS58_FORMAT = 42
const SS58_PREFIX = 'SS58PRE'

/* 
 * An address doesn't have a fixed length. Interpretation:
 * [total bytes: version bytes, payload bytes, checksum bytes]
 * 3:  1, 1,  1
 * 4:  1, 2,  1
 * 6:  1, 4,  1
 * 35: 1, 32, 2
 */
class Address {
    static fromPayload(payload: Uint8Array | string) {
        const payloadU8a = isString(payload) ? Buffer.from(stripHexPrefix(payload), 'hex') : payload
        const version = new Uint8Array([SS58_FORMAT])
        const checksum = generateChecksum(Buffer.concat([version, payloadU8a]))
        const checksumBytes = payloadU8a.length === 32 ? 2 : 1

        return new Address(version, payloadU8a, checksum.subarray(0, checksumBytes))
    }

    static fromBytes(bytes: Uint8Array): Address {
        const checksumBytes = bytes.length === 35 ? 2 : 1

        const version = bytes.slice(0, 1)
        const payload = bytes.slice(1, -checksumBytes)
        const checksum = bytes.slice(-checksumBytes)

        return new Address(version, payload, checksum)
    }

    constructor(readonly version: Uint8Array, readonly payload: Uint8Array, readonly checksum: Uint8Array) {}

    public asBytes(): Uint8Array {
        return Buffer.concat([this.version, this.payload, this.checksum])
    }
}

function generateChecksum(input: Uint8Array): Uint8Array {
    const prefixBuffer = Buffer.from(SS58_PREFIX)
    return blake2bAsBytes(Buffer.concat([prefixBuffer, input]), 512)
}

export function decodeAddress(encoded: string): Uint8Array {
    if (isHex(encoded)) {
        return new Uint8Array(Buffer.from(stripHexPrefix(encoded), 'hex'))
    }

    const decoded = Address.fromBytes(bs58.decode(encoded))
    return decoded.payload
}

export function encodeAddress(payload: Uint8Array | string): string {
    const decoded = Address.fromPayload(payload)

    return bs58.encode(decoded.asBytes())
}