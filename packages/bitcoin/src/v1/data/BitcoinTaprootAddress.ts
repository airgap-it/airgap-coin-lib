import { Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import * as bitcoin from 'bitcoinjs-lib'
import { BIP32Interface } from 'bip32'

export class BitcoinTaprootAddress {
  private constructor(protected readonly value: string) {}

  public static fromBip32(bip32: BIP32Interface): BitcoinTaprootAddress {
    const xOnlyPubkey = bip32.publicKey.slice(1, 33)

    const payment = bitcoin.payments.p2tr({
      internalPubkey: Buffer.from(xOnlyPubkey),
      network: bitcoin.networks.bitcoin
    })

    if (payment.address === undefined) {
      throw new UnsupportedError(Domain.BITCOIN, 'Could not generate Taproot address from BIP32.')
    }

    return new BitcoinTaprootAddress(payment.address)
  }

  public static fromPayment(payment: bitcoin.Payment): BitcoinTaprootAddress {
    if (payment.address === undefined) {
      throw new UnsupportedError(Domain.BITCOIN, 'Could not generate Taproot address from payment.')
    }

    return new BitcoinTaprootAddress(payment.address)
  }

  public asString(): string {
    return this.value
  }
}
