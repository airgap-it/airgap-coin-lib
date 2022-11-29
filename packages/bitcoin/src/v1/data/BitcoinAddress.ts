// tslint:disable: max-classes-per-file
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
