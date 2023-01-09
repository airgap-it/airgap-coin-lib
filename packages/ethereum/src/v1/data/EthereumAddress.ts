// @ts-ignore
import * as ethUtil from '@airgap/coinlib-core/dependencies/src/ethereumjs-util-5.2.0'
import { ExtendedPublicKey, PublicKey } from '@airgap/module-kit'

import { convertExtendedPublicKey, convertPublicKey } from '../utils/key'

export class EthereumAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: PublicKey | ExtendedPublicKey): EthereumAddress {
    const hexPublicKey: PublicKey | ExtendedPublicKey =
      publicKey.type === 'pub' ? convertPublicKey(publicKey, 'hex') : convertExtendedPublicKey(publicKey, 'hex')
    const bufferPublicKey: Buffer = Buffer.from(hexPublicKey.value, 'hex')

    const address: string = ethUtil.toChecksumAddress(ethUtil.pubToAddress(bufferPublicKey, true).toString('hex'))

    return new EthereumAddress(address)
  }

  public asString(): string {
    return this.value
  }
}
