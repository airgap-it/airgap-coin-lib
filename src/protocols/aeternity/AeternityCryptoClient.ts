import * as sodium from 'libsodium-wrappers'

import { CryptoClient } from '../CryptoClient'

const personalMessageToBinary = (message: string): Buffer => {
  const prefix: Buffer = Buffer.from('‎Æternity Signed Message:\n', 'utf8')
  const messageBuffer: Buffer = Buffer.from(message, 'utf8')
  if (messageBuffer.length >= 0xfd) {
    throw new Error('message too long')
  }

  return Buffer.concat([Buffer.from([prefix.length]), prefix, Buffer.from([messageBuffer.length]), messageBuffer])
}

export class AeternityCryptoClient extends CryptoClient {
  constructor() {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    await sodium.ready

    const messageBuffer: Buffer = personalMessageToBinary(message)
    const rawSignature: Uint8Array = sodium.crypto_sign_detached(messageBuffer, keypair.privateKey)

    return Buffer.from(rawSignature).toString('hex')
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    await sodium.ready

    const rawSignature: Buffer = Buffer.from(signature, 'hex')
    const messageBuffer: Buffer = personalMessageToBinary(message)

    return sodium.crypto_sign_verify_detached(rawSignature, messageBuffer, Buffer.from(publicKey, 'hex'))
  }
}
