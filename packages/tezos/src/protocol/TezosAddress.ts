import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { IAirGapAddress } from '@airgap/coinlib-core/interfaces/IAirGapAddress'
import { hash } from '@stablelib/blake2b'

import { TezosUtils } from './TezosUtils'

export class TezosAddress implements IAirGapAddress {
  protected constructor(private readonly value: string) {}

  public static async fromPublicKey(publicKey: string): Promise<TezosAddress> {
    const payload: Uint8Array = hash(Buffer.from(publicKey, 'hex'), 20)
    const address: string = bs58check.encode(Buffer.concat([TezosUtils.tezosPrefixes.tz1, Buffer.from(payload)]))

    return new TezosAddress(address)
  }

  public static async fromValue(value: string): Promise<TezosAddress> {
    if (!TezosAddress.isTzAddress(value)) {
      throw new Error(`Invalid address, expected a 'tz' address, got ${JSON.stringify(value)}`)
    }

    return new TezosAddress(value)
  }

  public static async fromRawTz(rawTz: string | Buffer): Promise<TezosAddress> {
    return TezosAddress.fromValue(TezosUtils.parseTzAddress(rawTz))
  }

  public static isTzAddress(address: string): boolean {
    return address.startsWith('tz1') || address.startsWith('tz2') || address.startsWith('tz3')
  }

  public asString(): string {
    return this.value
  }
}
