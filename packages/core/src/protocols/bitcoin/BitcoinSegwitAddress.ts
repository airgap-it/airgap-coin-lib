import { BitcoinAddress } from './BitcoinAddress'

export class BitcoinSegwitAddress extends BitcoinAddress {
  // TODO: types
  constructor(value: string, visibilityDerivationIndex?: number, addressDerivationIndex?: number) {
    super(value, visibilityDerivationIndex, addressDerivationIndex)
  }

  public static from(node: any, visibilityDerivationIndex?: number, addressDerivationIndex?: number): BitcoinSegwitAddress {
    const _node =
      visibilityDerivationIndex !== undefined && addressDerivationIndex !== undefined
        ? node.derive(visibilityDerivationIndex).derive(addressDerivationIndex)
        : node

    return new BitcoinSegwitAddress(_node.getAddress(), visibilityDerivationIndex, addressDerivationIndex)
  }

  public static fromAddress(address: string): BitcoinSegwitAddress {
    return new BitcoinSegwitAddress(address, 0, 0)
  }

  public getValue(): string {
    return this.value
  }
}
