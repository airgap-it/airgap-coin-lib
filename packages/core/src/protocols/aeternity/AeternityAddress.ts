import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'
import { CoinAddress } from '../ICoinProtocol'

export class AeternityAddress implements CoinAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: string): AeternityAddress {
    const base58 = bs58check.encode(Buffer.from(publicKey, 'hex'))

    return new AeternityAddress(`ak_${base58}`)
  }

  public getValue(): string {
    return this.value
  }
}