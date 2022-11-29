import BECH32 = require('@airgap/coinlib-core/dependencies/src/bech32-1.1.3/index')
import RIPEMD160 = require('@airgap/coinlib-core/dependencies/src/ripemd160-2.0.2/index')
import sha = require('@airgap/coinlib-core/dependencies/src/sha.js-2.4.11/index')
import { PublicKey } from '@airgap/module-kit'

import { convertPublicKey } from '../utils/key'

const ADDRESS_PREFIX: string = 'cosmos'

export class CosmosAddress {
  private constructor(private readonly value: string) {}

  public static from(publicKey: PublicKey): CosmosAddress {
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    const sha256Hash: string = sha('sha256').update(Buffer.from(hexPublicKey.value, 'hex')).digest()
    const hash = new RIPEMD160().update(Buffer.from(sha256Hash)).digest()
    const address = BECH32.encode(ADDRESS_PREFIX, BECH32.toWords(hash))

    return new CosmosAddress(address)
  }

  public asString(): string {
    return this.value
  }
}
