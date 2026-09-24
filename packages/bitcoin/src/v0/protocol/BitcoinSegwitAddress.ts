import { BitcoinAddress, resolveFromArgs } from './BitcoinAddress'

export class BitcoinSegwitAddress extends BitcoinAddress {
  // TODO: types
  constructor(value: string, visibilityDerivationIndex?: number, addressDerivationIndex?: number) {
    super(value, visibilityDerivationIndex, addressDerivationIndex)
  }

  /**
   * Same dual call shape as `BitcoinAddress.from` (see there), but produces a P2WPKH (`bc1...`)
   * address when a `lib` is passed. The legacy shape preserves the pre-migration behaviour of
   * delegating to the node's `getAddress()`.
   */
  public static from(node: any, visibilityDerivationIndex?: number, addressDerivationIndex?: number): BitcoinSegwitAddress
  public static from(
    node: any,
    lib: { payments: any },
    network: any,
    visibilityDerivationIndex?: number,
    addressDerivationIndex?: number
  ): BitcoinSegwitAddress
  public static from(
    node: any,
    libOrVisibilityIndex?: { payments: any } | number,
    networkOrAddressIndex?: any,
    maybeVisibilityIndex?: number,
    maybeAddressIndex?: number
  ): BitcoinSegwitAddress {
    const args = resolveFromArgs(node, libOrVisibilityIndex, networkOrAddressIndex, maybeVisibilityIndex, maybeAddressIndex)

    const address: string =
      args.lib !== undefined
        ? args.lib.payments.p2wpkh({ pubkey: Buffer.from(args.node.publicKey), network: args.network }).address
        : args.node.getAddress()

    return new BitcoinSegwitAddress(address, args.visibilityDerivationIndex, args.addressDerivationIndex)
  }

  public static fromAddress(address: string): BitcoinSegwitAddress {
    return new BitcoinSegwitAddress(address, 0, 0)
  }

  public asString(): string {
    return this.value
  }
}
