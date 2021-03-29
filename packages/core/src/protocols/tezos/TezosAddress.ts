import * as sodium from 'libsodium-wrappers'

import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'
import { CoinAddress } from '../ICoinProtocol'

import { TezosUtils } from './TezosUtils'

export class TezosAddress implements CoinAddress {

  protected constructor(private readonly value: string) {}
  
  public static async fromPublicKey(publicKey: string): Promise<TezosAddress> {
    await sodium.ready

    const payload: Uint8Array = sodium.crypto_generichash(20, Buffer.from(publicKey, 'hex'))
    const address: string = bs58check.encode(Buffer.concat([TezosUtils.tezosPrefixes.tz1, Buffer.from(payload)]))

    return new TezosAddress(address)
  }

  public static async fromValue(value: string): Promise<TezosAddress> {
    if (!TezosAddress.isTzAddress(value)) {
      throw new Error(`Invalid address, expected a 'tz' address, got ${value}`)
    }

    return new TezosAddress(value)
  }

  public static async fromRawTz(rawTz: string | Buffer): Promise<TezosAddress> {
    return TezosAddress.fromValue(TezosUtils.parseTzAddress(rawTz))
  }

  public static isTzAddress(address: string): boolean {
    return address.startsWith('tz1') || address.startsWith('tz2') || address.startsWith('tz3')
  }

  public getValue(): string {
    return this.value
  }

}