import bs58 = require('../../../../../dependencies/src/bs58-4.0.1')
import { hexToBytes, isHex } from '../../../../../utils/hex'
import { blake2bAsBytes } from '../../../../../utils/blake2b'
import { isString } from 'util'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

// If changed, the test address in `test/protocols/specs/kusama.ts` must be changed accordingly
const SS58Format: Map<SubstrateNetwork, number> = new Map([
  [SubstrateNetwork.POLKADOT, 0],
  [SubstrateNetwork.KUSAMA, 2]
])
const SS58_PREFIX = 'SS58PRE'

export type SubstrateAccountId = string | SubstrateAddress

/*
 * An address doesn't have a fixed length. Interpretation:
 * [total bytes: version bytes, payload bytes, checksum bytes]
 * 3:  1, 1,  1
 * 4:  1, 2,  1
 * 6:  1, 4,  1
 * 35: 1, 32, 2
 */
export class SubstrateAddress {
  private static placeholder: SubstrateAddress | undefined
  public static createPlaceholder(): SubstrateAddress {
    if (!SubstrateAddress.placeholder) {
      const payload = new Uint8Array(32)
      payload.fill(0)

      SubstrateAddress.placeholder = new SubstrateAddress(Buffer.from([0]), Buffer.from(payload), Buffer.from([0, 0]))
    }

    return SubstrateAddress.placeholder
  }

  public static from(accountId: SubstrateAccountId, network: SubstrateNetwork): SubstrateAddress {
    if (isString(accountId) && isHex(accountId)) {
      return this.fromPublicKey(accountId, network)
    } else if (isString(accountId)) {
      return this.fromEncoded(accountId)
    } else {
      return accountId
    }
  }

  public static fromPublicKey(payload: Buffer | Uint8Array | string, network: SubstrateNetwork): SubstrateAddress {
    return this.fromPayload(hexToBytes(payload), SS58Format.get(network) || 42)
  }

  public static fromEncoded(encoded: string): SubstrateAddress {
    return this.fromBytes(bs58.decode(encoded))
  }

  private static fromBytes(bytes: Buffer | Uint8Array): SubstrateAddress {
    const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
    const checksumBytes = buffer.length === 35 ? 2 : 1

    const version = buffer.slice(0, 1)
    const payload = buffer.slice(1, -checksumBytes)
    const checksum = buffer.slice(-checksumBytes)

    return new SubstrateAddress(version, payload, checksum)
  }

  private static fromPayload(payload: Buffer, format: number) {
    const version = Buffer.from([format])
    const checksum = this.generateChecksum(Buffer.concat([version, payload]))
    const checksumBytes = payload.length === 32 ? 2 : 1

    return new SubstrateAddress(version, payload, checksum.slice(0, checksumBytes))
  }

  private static generateChecksum(input: Buffer): Buffer {
    const prefixBuffer = Buffer.from(SS58_PREFIX)
    return Buffer.from(blake2bAsBytes(Buffer.concat([prefixBuffer, input]), 512))
  }

  private encoded: string | null = null

  constructor(readonly version: Buffer, readonly payload: Buffer, readonly checksum: Buffer) {}

  public compare(other: SubstrateAccountId): number {
    if (isString(other) && isHex(other)) {
      return this.payload.compare(Buffer.from(other, 'hex'))
    } else if (isString(other)) {
      return this.toString().localeCompare(other)
    } else {
      return this.payload.compare(other.payload)
    }
  }

  public toString(): string {
    if (!this.encoded) {
      this.encoded = bs58.encode(Buffer.concat([this.version, this.payload, this.checksum]))
    }
    return this.encoded!
  }

  public getBufferPublicKey(): Buffer {
    return this.payload
  }

  public getHexPublicKey(): string {
    return this.payload.toString('hex')
  }
}
