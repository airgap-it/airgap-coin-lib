// @ts-ignore
import * as bs58 from '@airgap/coinlib-core/dependencies/src/bs58-4.0.1'
import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { Ed25519CryptoClient } from '@airgap/coinlib-core/protocols/Ed25519CryptoClient'
import { hash } from '@stablelib/blake2b'
import { sign, verify } from '@stablelib/ed25519'
import { encode } from '@stablelib/utf8'

import { decodeBase58, encodeBase58 } from '../utils/encoding'
import { WATERMARK } from '../utils/transaction'

export class TezosCryptoClient extends Ed25519CryptoClient {
  constructor() {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    const bufferMessage: Buffer = this.toBuffer(message)

    const hashBytes: Buffer = this.hash(bufferMessage)
    const rawSignature: Uint8Array = sign(Buffer.from(keypair.privateKey, 'hex'), hashBytes)
    const signature: string = encodeBase58(rawSignature, 'ed25519Signature')

    return signature
  }

  public operationSignature(privateKey: Buffer, binaryTransaction: Buffer): Buffer {
    const watermarkedForgedOperationBytes: Buffer = Buffer.concat([WATERMARK.operation, binaryTransaction])
    const hashedWatermarkedOpBytes: Buffer = this.hash(watermarkedForgedOperationBytes)

    return Buffer.from(sign(privateKey, hashedWatermarkedOpBytes))
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    let rawSignature: Buffer
    if (signature.startsWith('edsig')) {
      rawSignature = decodeBase58(signature, 'ed25519Signature')
    } else {
      throw new InvalidValueError(Domain.TEZOS, `invalid signature: ${JSON.stringify(signature)}`)
    }

    const bufferMessage: Buffer = this.toBuffer(message)

    const hashBytes: Buffer = this.hash(bufferMessage)
    const isValidSignature: boolean = verify(Buffer.from(publicKey, 'hex'), hashBytes, rawSignature)

    return isValidSignature
  }

  public toBuffer(message: string): Buffer {
    if (message.length % 2 !== 0) {
      return Buffer.from(encode(message))
    }

    let adjustedMessage = message

    if (message.startsWith('0x')) {
      adjustedMessage = message.slice(2)
    }

    const buffer = Buffer.from(adjustedMessage, 'hex')

    if (buffer.length === adjustedMessage.length / 2) {
      return buffer
    }

    return Buffer.from(encode(message))
  }

  public hash(message: Buffer, size: number = 32): Buffer {
    return Buffer.from(hash(message, size))
  }

  public blake2bLedgerHash(message: string): string {
    const buffer: Buffer = this.toBuffer(message)
    const hash: Buffer = this.hash(buffer)

    return bs58.encode(Buffer.from(hash))
  }
}
