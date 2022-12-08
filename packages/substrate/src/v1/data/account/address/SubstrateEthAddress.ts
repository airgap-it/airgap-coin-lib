import * as ethUtil from '@airgap/coinlib-core/dependencies/src/ethereumjs-util-5.2.0/index'
import { addHexPrefix, isHex, stripHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { isPublicKey, PublicKey } from '@airgap/module-kit'
import { convertPublicKey } from '../../../utils/keys'

import { SubstrateAccountId, SubstrateAddress } from './SubstrateAddress'

export class SubstrateEthAddress implements SubstrateAddress {
  public static createPlaceholder(): SubstrateEthAddress {
    const zeroAddress = Buffer.alloc(20)
    return new SubstrateEthAddress(zeroAddress.toString('hex'))
  }

  public static from(accountId: SubstrateAccountId<SubstrateEthAddress>): SubstrateEthAddress {
    if (typeof accountId === 'string' && isHex(accountId)) {
      return SubstrateEthAddress.fromBytes(accountId)
    } else if (isPublicKey(accountId)) {
      const hexPublicKey: PublicKey = convertPublicKey(accountId, 'hex')
      return SubstrateEthAddress.from(hexPublicKey.value)
    } else if (typeof accountId !== 'string') {
      return accountId
    } else {
      throw new Error('Invalid Moonbeam address')
    }
  }

  public static fromBytes(publicKeyOrAddress: string | Uint8Array | Buffer): SubstrateEthAddress {
    const stringValue: string =
      typeof publicKeyOrAddress === 'string' ? publicKeyOrAddress : Buffer.from(publicKeyOrAddress).toString('hex')

    if (!ethUtil.isValidAddress(addHexPrefix(stringValue))) {
      return SubstrateEthAddress.fromPublicKey(stringValue)
    }

    return new SubstrateEthAddress(stringValue)
  }

  public static fromPublicKey(publicKey: string | Uint8Array | Buffer): SubstrateEthAddress {
    const buffer: Buffer = typeof publicKey === 'string' ? Buffer.from(stripHexPrefix(publicKey), 'hex') : Buffer.from(publicKey)

    const address: string = ethUtil.pubToAddress(buffer, true).toString('hex')
    if (!ethUtil.isValidAddress(addHexPrefix(address))) {
      throw new Error('Invalid Moonbeam public key')
    }

    return new SubstrateEthAddress(address)
  }

  private readonly value: string

  constructor(value: string) {
    this.value = ethUtil.toChecksumAddress(value)
  }

  public compare(other: SubstrateAccountId<SubstrateEthAddress>): number {
    const value: string = typeof other === 'string' ? other : isPublicKey(other) ? convertPublicKey(other, 'hex').value : other.asString()

    return stripHexPrefix(this.asString()).localeCompare(stripHexPrefix(value))
  }

  public asString(): string {
    return addHexPrefix(this.value)
  }

  public getBufferBytes(): Buffer {
    return Buffer.from(stripHexPrefix(this.value))
  }

  public getHexBytes(): string {
    return stripHexPrefix(this.value)
  }
}
