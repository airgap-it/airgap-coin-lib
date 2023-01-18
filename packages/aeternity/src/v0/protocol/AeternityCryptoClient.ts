import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { Ed25519CryptoClient } from '@airgap/coinlib-core/protocols/Ed25519CryptoClient'
import { sign, verify } from '@stablelib/ed25519'

const personalMessageToBinary = (message: string): Buffer => {
  const prefix: Buffer = Buffer.from('‎Æternity Signed Message:\n', 'utf8')
  const messageBuffer: Buffer = Buffer.from(message, 'utf8')
  if (messageBuffer.length >= 0xfd) {
    throw new InvalidValueError(Domain.AETERNITY, 'message too long')
  }

  return Buffer.concat([Buffer.from([prefix.length]), prefix, Buffer.from([messageBuffer.length]), messageBuffer])
}

export class AeternityCryptoClient extends Ed25519CryptoClient {
  constructor() {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    const messageBuffer: Buffer = personalMessageToBinary(message)
    const rawSignature: Uint8Array = sign(Buffer.from(keypair.privateKey, 'hex'), messageBuffer)

    return Buffer.from(rawSignature).toString('hex')
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    const rawSignature: Buffer = Buffer.from(signature, 'hex')
    const messageBuffer: Buffer = personalMessageToBinary(message)

    return verify(Buffer.from(publicKey, 'hex'), messageBuffer, rawSignature)
  }
}
