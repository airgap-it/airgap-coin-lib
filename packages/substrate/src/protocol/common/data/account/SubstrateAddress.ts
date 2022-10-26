import bs58 = require('@airgap/coinlib-core/dependencies/src/bs58-4.0.1')
import { blake2bAsBytes } from '@airgap/coinlib-core/utils/blake2b'
import { hexToBytes, isHex } from '@airgap/coinlib-core/utils/hex'
import { SubstrateAccountId, SubstrateCompatAddress } from '../../../compat/SubstrateCompatAddress'

const SS58_PREFIX = 'SS58PRE'

/*
 * An address doesn't have a fixed length. Interpretation:
 * [total bytes: version bytes, payload bytes, checksum bytes]
 * 3:  1, 1,  1
 * 4:  1, 2,  1
 * 6:  1, 4,  1
 * 35: 1, 32, 2
 */
export class SubstrateAddress implements SubstrateCompatAddress {
  private static placeholder: SubstrateAddress | undefined
  public static createPlaceholder(): SubstrateAddress {
    if (!SubstrateAddress.placeholder) {
      const payload = new Uint8Array(32)
      payload.fill(0)

      SubstrateAddress.placeholder = new SubstrateAddress(Buffer.from([0]), Buffer.from(payload), Buffer.from([0, 0]))
    }

    return SubstrateAddress.placeholder
  }

  public static from(accountId: SubstrateAccountId<SubstrateAddress>, ss58Format: number = 42): SubstrateAddress {
    if (typeof accountId === 'string' && isHex(accountId)) {
      return SubstrateAddress.fromPublicKey(accountId, ss58Format)
    } else if (typeof accountId === 'string') {
      return SubstrateAddress.fromEncoded(accountId)
    } else {
      return accountId
    }
  }

  public static fromPublicKey(payload: Buffer | Uint8Array | string, ss58Format: number = 42): SubstrateAddress {
    return SubstrateAddress.fromPayload(hexToBytes(payload), ss58Format)
  }

  public static fromEncoded(encoded: string): SubstrateAddress {
    return SubstrateAddress.fromBytes(bs58.decode(encoded))
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

  private encoded: string | undefined

  constructor(readonly version: Buffer, readonly payload: Buffer, readonly checksum: Buffer) {}

  public compare(other: SubstrateAccountId<SubstrateAddress>): number {
    if (typeof other === 'string' && isHex(other)) {
      return this.payload.compare(Buffer.from(other, 'hex'))
    } else if (typeof other === 'string') {
      return this.asString().localeCompare(other)
    } else {
      return this.payload.compare(other.payload)
    }
  }

  public asString(): string {
    if (!this.encoded) {
      this.encoded = bs58.encode(Buffer.concat([this.version, this.payload, this.checksum]))
    }

    return this.encoded!
  }

  public getBufferBytes(): Buffer {
    return this.payload
  }

  public getHexBytes(): string {
    return this.payload.toString('hex')
  }
}
