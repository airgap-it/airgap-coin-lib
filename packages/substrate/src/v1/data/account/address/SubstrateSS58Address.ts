import bs58 = require('@airgap/coinlib-core/dependencies/src/bs58-4.0.1')
import { blake2bAsBytes } from '@airgap/coinlib-core/utils/blake2b'
import { hexToBytes, isHex } from '@airgap/coinlib-core/utils/hex'
import { isPublicKey, PublicKey } from '@airgap/module-kit'
import { convertPublicKey } from '../../../utils/keys'
import { SubstrateAccountId, SubstrateAddress } from './SubstrateAddress'

const SS58_PREFIX = 'SS58PRE'

/*
 * An address doesn't have a fixed length. Interpretation:
 * [total bytes: version bytes, payload bytes, checksum bytes]
 * 3:  1, 1,  1
 * 4:  1, 2,  1
 * 6:  1, 4,  1
 * 35: 1, 32, 2
 */
export class SubstrateSS58Address implements SubstrateAddress {
  private static placeholder: SubstrateSS58Address | undefined
  public static createPlaceholder(): SubstrateSS58Address {
    if (!SubstrateSS58Address.placeholder) {
      const payload = new Uint8Array(32)
      payload.fill(0)

      SubstrateSS58Address.placeholder = new SubstrateSS58Address(Buffer.from([0]), Buffer.from(payload), Buffer.from([0, 0]))
    }

    return SubstrateSS58Address.placeholder
  }

  public static from(accountId: SubstrateAccountId<SubstrateSS58Address>, ss58Format: number = 42): SubstrateSS58Address {
    if (typeof accountId === 'string' && isHex(accountId)) {
      return SubstrateSS58Address.fromPublicKey(accountId, ss58Format)
    } else if (typeof accountId === 'string') {
      return SubstrateSS58Address.fromEncoded(accountId)
    } else if (isPublicKey(accountId)) {
      const hexPublicKey: PublicKey = convertPublicKey(accountId, 'hex')
      return SubstrateSS58Address.from(hexPublicKey.value, ss58Format)
    } else {
      return accountId
    }
  }

  public static fromPublicKey(payload: Buffer | Uint8Array | string, ss58Format: number = 42): SubstrateSS58Address {
    return SubstrateSS58Address.fromPayload(hexToBytes(payload), ss58Format)
  }

  public static fromEncoded(encoded: string): SubstrateSS58Address {
    return SubstrateSS58Address.fromBytes(bs58.decode(encoded))
  }

  private static fromBytes(bytes: Buffer | Uint8Array): SubstrateSS58Address {
    const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
    const checksumBytes = buffer.length === 35 ? 2 : 1

    const version = buffer.slice(0, 1)
    const payload = buffer.slice(1, -checksumBytes)
    const checksum = buffer.slice(-checksumBytes)

    return new SubstrateSS58Address(version, payload, checksum)
  }

  private static fromPayload(payload: Buffer, format: number) {
    const version = Buffer.from([format])
    const checksum = this.generateChecksum(Buffer.concat([version, payload]))
    const checksumBytes = payload.length === 32 ? 2 : 1

    return new SubstrateSS58Address(version, payload, checksum.slice(0, checksumBytes))
  }

  private static generateChecksum(input: Buffer): Buffer {
    const prefixBuffer = Buffer.from(SS58_PREFIX)

    return Buffer.from(blake2bAsBytes(Buffer.concat([prefixBuffer, input]), 512))
  }

  private encoded: string | undefined

  constructor(readonly version: Buffer, readonly payload: Buffer, readonly checksum: Buffer) {}

  public compare(other: SubstrateAccountId<SubstrateSS58Address>): number {
    if (typeof other === 'string' && isHex(other)) {
      return this.payload.compare(Buffer.from(other, 'hex'))
    } else if (typeof other === 'string') {
      return this.asString().localeCompare(other)
    } else if (isPublicKey(other)) {
      const hexPublicKey: PublicKey = convertPublicKey(other, 'hex')
      return this.compare(hexPublicKey.value)
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
