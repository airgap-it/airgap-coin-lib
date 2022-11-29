import { IAirGapAddress } from '@airgap/coinlib-core/interfaces/IAirGapAddress'

export class BitcoinAddress implements IAirGapAddress {
  // TODO: types
  constructor(
    protected readonly value: string,
    public readonly visibilityDerivationIndex?: number,
    public readonly addressDerivationIndex?: number
  ) {}

  public static from(node: any, visibilityDerivationIndex?: number, addressDerivationIndex?: number): BitcoinAddress {
    const _node =
      visibilityDerivationIndex !== undefined && addressDerivationIndex !== undefined
        ? node.derive(visibilityDerivationIndex).derive(addressDerivationIndex)
        : node

    return new BitcoinAddress(_node.getAddress(), visibilityDerivationIndex, addressDerivationIndex)
  }

  public asString(): string {
    return this.value
  }
}
