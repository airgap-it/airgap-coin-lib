import { CoinAddress } from '../ICoinProtocol'

export class BitcoinAddress implements CoinAddress {
  // TODO: types
  private constructor(
    private readonly value: string,
    public readonly visibilityDerivationIndex?: number,
    public readonly addressDerivationIndex?: number
  ) {}

  public static from(node: any, visibilityDerivationIndex?: number, addressDerivationIndex?: number): BitcoinAddress {
    const _node = visibilityDerivationIndex !== undefined && addressDerivationIndex !== undefined
      ? node.derive(visibilityDerivationIndex).derive(addressDerivationIndex)
      : node

    return new BitcoinAddress(_node.getAddress(), visibilityDerivationIndex, addressDerivationIndex)
  }

  public getValue(): string {
    return this.value
  }
}