import * as sodium from 'libsodium-wrappers'

import * as bs58check from '../../dependencies/src/bs58check-2.1.2'
import { Ed25519CryptoClient } from '../Ed25519CryptoClient'

function isHex(str: string): boolean {
  const legend = '0123456789abcdef';
  for (let i = 0; i < str.length; i++) {
    if (legend.includes(str[i])) {
      continue;
    };
    return false;
  };
  return true;
};

export class TezosCryptoClient extends Ed25519CryptoClient {
  constructor(public readonly edsigPrefix: Uint8Array = new Uint8Array([9, 245, 205, 134, 18])) {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    await sodium.ready

    const bufferMessage = await this.toBuffer(message)

    const hash: Buffer = sodium.crypto_generichash(32, bufferMessage)
    const rawSignature: Uint8Array = sodium.crypto_sign_detached(hash, keypair.privateKey)
    const signature: string = bs58check.encode(Buffer.concat([Buffer.from(this.edsigPrefix), Buffer.from(rawSignature)]))

    return signature
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    await sodium.ready

    let rawSignature: Uint8Array
    if (signature.startsWith('edsig')) {
      const edsigPrefixLength: number = this.edsigPrefix.length
      const decoded: Buffer = bs58check.decode(signature)

      rawSignature = new Uint8Array(decoded.slice(edsigPrefixLength, decoded.length))
    } else {
      throw new Error(`invalid signature: ${signature}`)
    }

    const bufferMessage = await this.toBuffer(message)

    const hash: Buffer = sodium.crypto_generichash(32, bufferMessage)
    const isValidSignature: boolean = sodium.crypto_sign_verify_detached(rawSignature, hash, Buffer.from(publicKey, 'hex'))

    return isValidSignature
  }

  private async toBuffer(message: string): Promise<Buffer> {
    return isHex(message) ? // Check if the string is a hex string
      Buffer.from(message, 'hex') // If yes, then we interpret it as hex
      : sodium.from_string(message) // If not, then we let sodium convert it to a buffer (this is not compatible with the tezos-cli)

  }
}
