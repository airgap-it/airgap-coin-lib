import { ICoinProtocol } from '@airgap/coinlib-core'
import { Secp256k1CryptoClient } from '@airgap/coinlib-core/protocols/Secp256k1CryptoClient'

export class BitcoinCryptoClient extends Secp256k1CryptoClient {
  constructor(private readonly protocol: ICoinProtocol, private readonly bitcoinJSMessage: any) {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    const signature: Buffer = this.bitcoinJSMessage.sign(message, Buffer.from(keypair.privateKey, 'hex'), true)

    return signature.toString('base64')
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    const rawSignature: Buffer = Buffer.from(signature, 'base64')

    const address = await this.protocol.getAddressFromPublicKey(publicKey)

    return this.bitcoinJSMessage.verify(message, address.address, rawSignature)
  }
}
