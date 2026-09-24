import { Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import type * as bitcoin from '@airgap/coinlib-core/dependencies/src/bitcoinjs-lib-6.1.7/src/index'
import { BIP32Interface } from '@airgap/coinlib-core/dependencies/src/bip32-5.0.1/src/index'

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
