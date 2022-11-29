import BECH32 = require('@airgap/coinlib-core/dependencies/src/bech32-1.1.3/index')
import RIPEMD160 = require('@airgap/coinlib-core/dependencies/src/ripemd160-2.0.2/index')
import sha = require('@airgap/coinlib-core/dependencies/src/sha.js-2.4.11/index')
import { IAirGapAddress } from '@airgap/coinlib-core/interfaces/IAirGapAddress'

export class CosmosAddress implements IAirGapAddress {
  private static readonly addressPrefix: string = 'cosmos'

  private constructor(private readonly value: string) {}

  public static from(publicKey: string): CosmosAddress {
    const pubkey = Buffer.from(publicKey, 'hex')

    const sha256Hash: string = sha('sha256').update(pubkey).digest()
    const hash = new RIPEMD160().update(Buffer.from(sha256Hash)).digest()
    const address = BECH32.encode(CosmosAddress.addressPrefix, BECH32.toWords(hash))

    return new CosmosAddress(address)
  }

  public asString(): string {
    return this.value
  }
}
