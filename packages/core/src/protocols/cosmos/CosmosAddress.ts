import BECH32 = require('../../dependencies/src/bech32-1.1.3/index')
import RIPEMD160 = require('../../dependencies/src/ripemd160-2.0.2/index')
import sha = require('../../dependencies/src/sha.js-2.4.11/index')
import { CoinAddress } from '../ICoinProtocol'

export class CosmosAddress implements CoinAddress {
  private static readonly addressPrefix: string = 'cosmos'

  private constructor(private readonly value: string) {}

  public static from(publicKey: string): CosmosAddress {
    const pubkey = Buffer.from(publicKey, 'hex')

    const sha256Hash: string = sha('sha256').update(pubkey).digest()
    const hash = new RIPEMD160().update(Buffer.from(sha256Hash)).digest()
    const address = BECH32.encode(CosmosAddress.addressPrefix, BECH32.toWords(hash))

    return new CosmosAddress(address)
  }

  public getValue(): string {
    return this.value
  }
}
