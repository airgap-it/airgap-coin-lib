import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { IAirGapAddress } from '@airgap/coinlib-core/interfaces/IAirGapAddress'
export class AeternityAddress implements IAirGapAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: string): AeternityAddress {
    const base58 = bs58check.encode(Buffer.from(publicKey, 'hex'))

    return new AeternityAddress(`ak_${base58}`)
  }

  public asString(): string {
    return this.value
  }
}
