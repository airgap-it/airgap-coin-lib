import { newPublicKey, PublicKey } from '@airgap/module-kit'

import { StrKey } from '@stellar/stellar-sdk'

export class StellarAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: PublicKey): StellarAddress {
    if (StrKey.isValidEd25519PublicKey(publicKey.value)) {
      return new StellarAddress(publicKey.value)
    }

    const rawPublicKey = Buffer.from(publicKey.value, 'hex')

    const stellarAddress = StrKey.encodeEd25519PublicKey(rawPublicKey)

    return new StellarAddress(stellarAddress)
  }

  public asString(): string {
    return this.value
  }

  public toPublicKey(): PublicKey {
    return newPublicKey(this.value, 'encoded')
  }
}
