import { TezosAddress } from '../TezosAddress'

export class TezosKtAddress extends TezosAddress {
  public static async from(value: string): Promise<TezosKtAddress> {
    return new TezosKtAddress(value)
  }

  public static isKtAddress(address: string): boolean {
    return address.startsWith('KT1')
  }
}
