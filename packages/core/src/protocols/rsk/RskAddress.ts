import * as ethUtil from '../../dependencies/src/ethereumjs-util-5.2.0/index'
import { CoinAddress } from '../ICoinProtocol'
import { RskUtils } from './utils/utils'
export class RskAddress implements CoinAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: string | Buffer): RskAddress {
    const pubkey: Buffer = typeof publicKey === 'string' ? Buffer.from(publicKey, 'hex') : publicKey

    return new RskAddress(RskUtils.toChecksumAddress(ethUtil.pubToAddress(pubkey, true).toString('hex')))
  }

  public getValue(): string {
    return this.value
  }
}
