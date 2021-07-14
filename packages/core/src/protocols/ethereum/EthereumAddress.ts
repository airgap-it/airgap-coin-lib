import * as ethUtil from '../../dependencies/src/ethereumjs-util-5.2.0/index'
import { CoinAddress } from '../ICoinProtocol'

export class EthereumAddress implements CoinAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: string | Buffer): EthereumAddress {
    const pubkey: Buffer = typeof publicKey === 'string' ? Buffer.from(publicKey, 'hex') : publicKey

    return new EthereumAddress(ethUtil.toChecksumAddress(ethUtil.pubToAddress(pubkey, true).toString('hex')))
  }

  public getValue(): string {
    return this.value
  }
}
