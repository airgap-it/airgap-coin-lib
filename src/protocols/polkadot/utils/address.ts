import bs58 = require('../../../dependencies/src/bs58-4.0.1')

import { isHex, stripHexPrefix } from "../../../utils/hex"
import { blake2bAsBytes } from '../../../utils/blake2b'
import { isString } from 'util'

/*
 * Polkadot Live: 0 (SS58 checksum preimage), 1 (AccountId checksum preimage)
 * Polkadot Canary: 2 (SS58), 3 (AccountId)
 * Kulupu: 16 (SS58), 17 (Reserved)
 * Dothereum: 20 (SS58), 21 (AccountId)
 * Substrate: 42 (SS58), 43 (AccountId)
 * 
 * If changed, the test address in `test/protocols/specs/polkadot.ts` must be changed accordingly
 */
const SS58_FORMAT = 2
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
    static fromPayload(payload: Buffer) {
        const version = Buffer.from([SS58_FORMAT])
        const checksum = generateChecksum(Buffer.concat([version, payload]))
        const checksumBytes = payload.length === 32 ? 2 : 1

        return new Address(version, payload, checksum.slice(0, checksumBytes))
    }

    static fromBytes(bytes: Buffer): Address {
        const checksumBytes = bytes.length === 35 ? 2 : 1

        const version = bytes.slice(0, 1)
        const payload = bytes.slice(1, -checksumBytes)
        const checksum = bytes.slice(-checksumBytes)

        return new Address(version, payload, checksum)
    }

    constructor(readonly version: Buffer, readonly payload: Buffer, readonly checksum: Buffer) {}

    public asBytes(): Buffer {
        return Buffer.concat([this.version, this.payload, this.checksum])
    }
}

function generateChecksum(input: Buffer): Buffer {
    const prefixBuffer = Buffer.from(SS58_PREFIX)
    return Buffer.from(blake2bAsBytes(Buffer.concat([prefixBuffer, input]), 512))
}

export function decodeAddress(encoded: string): Buffer {
    if (isHex(encoded)) {
        return Buffer.from(stripHexPrefix(encoded), 'hex')
    }

    const decoded = Address.fromBytes(bs58.decode(encoded))
    return decoded.payload
}

export function encodeAddress(payload: Buffer | Uint8Array | string): string {
    const payloadBuffer = isString(payload) ? Buffer.from(stripHexPrefix(payload), 'hex') : Buffer.from(payload)
    const decoded = Address.fromPayload(payloadBuffer)

    return bs58.encode(decoded.asBytes())
}