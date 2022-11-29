import { AddressCursor, newPublicKey, PublicKey } from '@airgap/module-kit'

import { aePublicKey, convertPublicKey } from '../utils/key'

export interface AeternityAddressCursor extends AddressCursor {}

export class AeternityAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: string | PublicKey): AeternityAddress {
    const _publicKey = typeof publicKey === 'string' ? aePublicKey(publicKey) : publicKey

    return new AeternityAddress(convertPublicKey(_publicKey, 'encoded').value)
  }

  public asString(): string {
    return this.value
  }

  public toPublicKey(): PublicKey {
    return newPublicKey(this.value, 'encoded')
  }
}
