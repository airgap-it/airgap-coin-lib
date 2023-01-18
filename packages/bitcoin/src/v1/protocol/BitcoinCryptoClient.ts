import { Secp256k1CryptoClient } from '@airgap/coinlib-core/protocols/Secp256k1CryptoClient'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { ExtendedPublicKey, newExtendedPublicKey, newPublicKey, PublicKey } from '@airgap/module-kit'

import { BitcoinProtocol } from '../../v1'
import { BitcoinJS } from '../types/bitcoinjs'

export class BitcoinCryptoClient extends Secp256k1CryptoClient {
  constructor(private readonly protocol: BitcoinProtocol, private readonly bitcoinjs: BitcoinJS) {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    const signature: Buffer = this.bitcoinjs.message.sign(message, Buffer.from(keypair.privateKey, 'hex'), true)

    return signature.toString('base64')
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    const rawSignature: Buffer = Buffer.from(signature, 'base64')

    // TODO: pass objects directly instead of string values
    const _publicKey: PublicKey | ExtendedPublicKey = isHex(publicKey)
      ? newPublicKey(publicKey, 'hex')
      : newExtendedPublicKey(publicKey, 'encoded')

    const address = await this.protocol.getAddressFromPublicKey(_publicKey)

    return this.bitcoinjs.message.verify(message, address, rawSignature)
  }
}
