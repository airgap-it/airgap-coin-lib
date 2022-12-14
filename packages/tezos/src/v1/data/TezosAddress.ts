import { PublicKey } from '@airgap/module-kit'

import { tz1Address } from '../utils/address'

export class TezosAddress {
  protected constructor(private readonly value: string) {}

  public static fromPublicKey(publicKey: PublicKey): TezosAddress {
    return new TezosAddress(tz1Address(publicKey))
  }

  public static fromValue(value: string): TezosAddress {
    if (!TezosAddress.isTzAddress(value)) {
      throw new Error(`Invalid address, expected a 'tz' address, got ${JSON.stringify(value)}`)
    }

    return new TezosAddress(value)
  }

  public static isTzAddress(address: string): boolean {
    return address.startsWith('tz1') || address.startsWith('tz2') || address.startsWith('tz3')
  }

  public asString(): string {
    return this.value
  }
}
