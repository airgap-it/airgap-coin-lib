import { ICoinProtocol } from '../..'
import { Secp256k1CryptoClient } from '../Secp256k1CryptoClient'

export class BitcoinCryptoClient extends Secp256k1CryptoClient {
  constructor(private readonly protocol: ICoinProtocol, private readonly bitcoinJSMessage: any) {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    const signature: Buffer = this.bitcoinJSMessage.sign(message, keypair.privateKey, true)

    return signature.toString('base64')
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    const rawSignature: Buffer = Buffer.from(signature, 'base64')

    const address: string = await this.protocol.getAddressFromPublicKey(publicKey)

    return this.bitcoinJSMessage.verify(message, address, rawSignature)
  }
}
