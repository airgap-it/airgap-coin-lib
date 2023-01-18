// @ts-ignore
import * as bs58 from '@airgap/coinlib-core/dependencies/src/bs58-4.0.1'
// @ts-ignore
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2'
import { InvalidValueError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { Ed25519CryptoClient } from '@airgap/coinlib-core/protocols/Ed25519CryptoClient'
import { hash } from '@stablelib/blake2b'
import { sign, verify } from '@stablelib/ed25519'
import { encode } from '@stablelib/utf8'

import { RawTezosTransaction } from '../types/transaction-tezos'

import { TezosUtils } from './TezosUtils'

export class TezosCryptoClient extends Ed25519CryptoClient {
  constructor(public readonly edsigPrefix: Uint8Array = new Uint8Array([9, 245, 205, 134, 18])) {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    const bufferMessage: Buffer = this.toBuffer(message)

    const hashBytes: Buffer = this.hash(bufferMessage)
    const rawSignature: Uint8Array = sign(Buffer.from(keypair.privateKey, 'hex'), hashBytes)
    const signature: string = bs58check.encode(Buffer.concat([Buffer.from(this.edsigPrefix), Buffer.from(rawSignature)]))

    return signature
  }

  public operationSignature(privateKey: Buffer, transaction: RawTezosTransaction): Buffer {
    const watermarkedForgedOperationBytesHex: string = TezosUtils.watermark.operation + transaction.binaryTransaction
    const watermarkedForgedOperationBytes: Buffer = Buffer.from(watermarkedForgedOperationBytesHex, 'hex')
    const hashedWatermarkedOpBytes: Buffer = this.hash(watermarkedForgedOperationBytes)

    return Buffer.from(sign(privateKey, hashedWatermarkedOpBytes))
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    let rawSignature: Uint8Array
    if (signature.startsWith('edsig')) {
      const edsigPrefixLength: number = this.edsigPrefix.length
      const decoded: Buffer = bs58check.decode(signature)

      rawSignature = new Uint8Array(decoded.slice(edsigPrefixLength, decoded.length))
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
