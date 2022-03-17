import SECP256K1 = require('../../dependencies/src/secp256k1-3.7.1/elliptic')
import sha = require('../../dependencies/src/sha.js-2.4.11/index')
import { Secp256k1CryptoClient } from '../Secp256k1CryptoClient'

export class CosmosCryptoClient extends Secp256k1CryptoClient {
  constructor() {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    const sha256Hash: string = sha('sha256').update(Buffer.from(message)).digest()
    const hash: Buffer = Buffer.from(sha256Hash)
    const signed: { signature: Buffer } = SECP256K1.sign(hash, keypair.privateKey)

    return `0x${Buffer.from(signed.signature).toString('hex')}`
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    const rawSignature: Buffer = Buffer.from(signature.slice(2), 'hex')

    const sha256Hash: string = sha('sha256').update(Buffer.from(message)).digest()
    const messageHash: Buffer = Buffer.from(sha256Hash)

    return SECP256K1.verify(messageHash, rawSignature, Buffer.from(publicKey, 'hex'))
  }
}
