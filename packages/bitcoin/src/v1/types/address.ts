// tslint:disable: max-classes-per-file
import { Domain } from '@airgap/coinlib-core'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { AddressCursor } from '@airgap/module-kit'
import type * as bitcoin from 'bitcoinjs-lib'

export interface BitcoinAddressCursor extends AddressCursor {}

export class BitcoinAddress {
  private constructor(protected readonly value: string) {}

  public static fromHDNode(node: any): BitcoinAddress {
    return new BitcoinAddress(node.getAddress())
  }

  public static fromECPair(keyPair: any): BitcoinAddress {
    return new BitcoinAddress(keyPair.getAddress())
  }

  public asString(): string {
    return this.value
  }
}

export class BitcoinSegwitAddress {
  private constructor(protected readonly value: string) {}

  public static fromBip32(bip32: bitcoin.BIP32Interface): BitcoinSegwitAddress {
    return new BitcoinSegwitAddress(bip32.toBase58())
  }

  public static fromPayment(payment: bitcoin.Payment): BitcoinSegwitAddress {
    if (payment.address === undefined) {
      throw new UnsupportedError(Domain.BITCOIN, 'Could not generate address.')
    }

    return new BitcoinSegwitAddress(payment.address)
  }

  public asString(): string {
    return this.value
  }
}
