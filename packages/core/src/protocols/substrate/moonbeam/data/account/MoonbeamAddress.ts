import * as ethUtil from '../../../../../dependencies/src/ethereumjs-util-5.2.0/index'
import { addHexPrefix, isHex, stripHexPrefix } from '../../../../../utils/hex'
import { SubstrateAccountId, SubstrateCompatAddress } from '../../../compat/SubstrateCompatAddress'

export class MoonbeamAddress implements SubstrateCompatAddress {
  public static getPlaceholder(): MoonbeamAddress {
    const zeroAddress = Buffer.alloc(20)
    return new MoonbeamAddress(zeroAddress.toString('hex'))
  }

  public static from(accountId: SubstrateAccountId<MoonbeamAddress>): MoonbeamAddress {
    if (typeof accountId === 'string' && isHex(accountId)) {
      return MoonbeamAddress.fromBytes(accountId)
    } else if (typeof accountId !== 'string') {
      return accountId
    } else {
      throw new Error('Invalid Moonbeam address')
    }
  }

  public static fromBytes(publicKeyOrAddress: string | Uint8Array | Buffer): MoonbeamAddress {
    const stringValue: string =
      typeof publicKeyOrAddress === 'string' ? publicKeyOrAddress : Buffer.from(publicKeyOrAddress).toString('hex')

    if (!ethUtil.isValidAddress(addHexPrefix(stringValue))) {
      return MoonbeamAddress.fromPublicKey(stringValue)
    }

    return new MoonbeamAddress(stringValue)
  }

  public static fromPublicKey(publicKey: string | Uint8Array | Buffer): MoonbeamAddress {
    const buffer: Buffer = typeof publicKey === 'string' ? Buffer.from(stripHexPrefix(publicKey), 'hex') : Buffer.from(publicKey)

    const address: string = ethUtil.pubToAddress(buffer, true).toString('hex')
    if (!ethUtil.isValidAddress(addHexPrefix(address))) {
      throw new Error('Invalid Moonbeam public key')
    }

    return new MoonbeamAddress(address)
  }

  private readonly value: string

  constructor(value: string) {
    this.value = ethUtil.toChecksumAddress(value)
  }

  public compare(other: SubstrateAccountId<MoonbeamAddress>): number {
    const value: string = typeof other === 'string' ? other : other.getValue()

    return stripHexPrefix(this.getValue()).localeCompare(stripHexPrefix(value))
  }

  public getValue(): string {
    return addHexPrefix(this.value)
  }

  public getBufferBytes(): Buffer {
    return Buffer.from(stripHexPrefix(this.value))
  }

  public getHexBytes(): string {
    return stripHexPrefix(this.value)
  }
}
