import { Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import type * as bitcoin from 'bitcoinjs-lib'
import { BIP32Interface } from 'bip32'

export class BitcoinLegacyAddress {
  private constructor(protected readonly value: string) {}

  public static fromBip32(bip32: BIP32Interface): BitcoinLegacyAddress {
    return new BitcoinLegacyAddress(bip32.toBase58())
  }

  public static fromPayment(payment: bitcoin.Payment): BitcoinLegacyAddress {
    if (payment.address === undefined) {
      throw new UnsupportedError(Domain.BITCOIN, 'Could not generate address.')
    }

    return new BitcoinLegacyAddress(payment.address)
  }

  public asString(): string {
    return this.value
  }
}
