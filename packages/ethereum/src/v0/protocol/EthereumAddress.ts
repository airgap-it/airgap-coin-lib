import * as ethUtil from '@airgap/coinlib-core/dependencies/src/ethereumjs-util-5.2.0'
import { IAirGapAddress } from '@airgap/coinlib-core/interfaces/IAirGapAddress'

export class EthereumAddress implements IAirGapAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: string | Buffer): EthereumAddress {
    const pubkey: Buffer = typeof publicKey === 'string' ? Buffer.from(publicKey, 'hex') : publicKey

    return new EthereumAddress(ethUtil.toChecksumAddress(ethUtil.pubToAddress(pubkey, true).toString('hex')))
  }

  public asString(): string {
    return this.value
  }
}
