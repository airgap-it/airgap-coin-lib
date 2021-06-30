import BigNumber from '../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { toHexBuffer } from '../../../../utils/hex'
import { TezosSaplingCiphertext } from '../../types/sapling/TezosSaplingCiphertext'
import {
  TezosSaplingOutputDescription,
  TezosSaplingSpendDescription,
  TezosSaplingTransaction
} from '../../types/sapling/TezosSaplingTransaction'

// REFACTORME: more generic?
export class TezosSaplingEncoder {
  public encodeTransaction(transaction: TezosSaplingTransaction): Buffer {
    const spendBytes: Buffer = this.encodeSpendDescriptions(transaction.spendDescriptions)
    const spendEncoded: Buffer = Buffer.concat([toHexBuffer(spendBytes.length, 32), spendBytes])

    const outBytes: Buffer = this.encodeOutputDescriptions(transaction.outputDescriptions)
    const outEncoded: Buffer = Buffer.concat([toHexBuffer(outBytes.length, 32), outBytes])

    const balanceEncoded: Buffer = toHexBuffer(transaction.balance, 64)

    return Buffer.concat([spendEncoded, outEncoded, transaction.bindingSignature, balanceEncoded, Buffer.from(transaction.root, 'hex')])
  }

  public encodeSpendDescriptions(descriptions: TezosSaplingSpendDescription[]): Buffer {
    return this.encodeDescriptions(descriptions, this.encodeSpendDescription.bind(this))
  }

  public encodeSpendDescription(description: TezosSaplingSpendDescription): Buffer {
    return Buffer.concat([description.cv, description.nf, description.rk, description.proof, description.signature])
  }

  public encodeOutputDescriptions(descriptions: TezosSaplingOutputDescription[]): Buffer {
    return this.encodeDescriptions(descriptions, this.encodeOutputDescription.bind(this))
  }

  public encodeOutputDescription(description: TezosSaplingOutputDescription): Buffer {
    const ciphertextBytes: Buffer = this.encodeCiphertext(description.ciphertext)

    return Buffer.concat([description.cm, description.proof, ciphertextBytes])
  }

  private encodeDescriptions<T>(descriptions: T[], encoder: (description: T) => Buffer): Buffer {
    return Buffer.concat(descriptions.map(encoder))
  }

  private encodeCiphertext(ciphertext: TezosSaplingCiphertext): Buffer {
    const cv: Buffer = Buffer.from(ciphertext.cv, 'hex')
    const epk: Buffer = Buffer.from(ciphertext.epk, 'hex')
    const payloadEnc: Buffer = Buffer.from(ciphertext.payload_enc, 'hex')
    const nonceEnc: Buffer = Buffer.from(ciphertext.nonce_enc, 'hex')
    const payloadOut: Buffer = Buffer.from(ciphertext.payload_out, 'hex')
    const nonceOut: Buffer = Buffer.from(ciphertext.nonce_out, 'hex')

    return Buffer.concat([cv, epk, toHexBuffer(payloadEnc.length, 32), payloadEnc, nonceEnc, payloadOut, nonceOut])
  }

  public decodeTransaction(transaction: Buffer): TezosSaplingTransaction {
    const spendLength: number = transaction.readInt32BE(0)
    const spendStart: number = 4
    const spendEnd: number = spendStart + spendLength
    const spendDescriptions: TezosSaplingSpendDescription[] = this.decodeSpendDescriptions(transaction.slice(spendStart, spendEnd))

    const outLength: number = transaction.readInt32BE(spendEnd)
    const outStart: number = spendEnd + 4
    const outEnd: number = outStart + outLength
    const outputDescriptions: TezosSaplingOutputDescription[] = this.decodeOutputDescriptions(transaction.slice(outStart, outEnd))

    const sigStart: number = outEnd
    const sigEnd: number = sigStart + 64
    const bindingSignature: Buffer = transaction.slice(sigStart, sigEnd)

    const balanceStart: number = sigEnd
    const balanceEnd: number = balanceStart + 8
    const balance: BigNumber = this.decodeBalance(transaction.slice(balanceStart, balanceEnd))

    const rootStart: number = balanceEnd
    const rootEnd: number = rootStart + 32
    const root: string = transaction.slice(rootStart, rootEnd).toString('hex')

    return {
      spendDescriptions,
      outputDescriptions,
      bindingSignature,
      balance,
      root
    }
  }

  public decodeSpendDescriptions(bytes: Buffer): TezosSaplingSpendDescription[] {
    return this.decodeDescriptions(bytes, this.decodeSpendDescription.bind(this), this.encodeSpendDescription.bind(this))
  }

  public decodeSpendDescription(bytes: Buffer): TezosSaplingSpendDescription {
    return {
      cv: bytes.slice(0, 32) /* 32 bytes */,
      nf: bytes.slice(32, 64) /* 32 bytes */,
      rk: bytes.slice(64, 96) /* 32 bytes */,
      proof: bytes.slice(96, 288) /* 48 + 96 + 48 bytes */,
      signature: bytes.slice(288, 352) /* 64 bytes */
    }
  }

  public decodeOutputDescriptions(bytes: Buffer): TezosSaplingOutputDescription[] {
    return this.decodeDescriptions(bytes, this.decodeOutputDescription.bind(this), this.encodeOutputDescription.bind(this))
  }

  private decodeDescriptions<T>(bytes: Buffer, decoder: (bytes: Buffer) => T, encoder: (description: T) => Buffer): T[] {
    const descriptions: T[] = []

    let next: number = 0
    while (next < bytes.length) {
      const decoded: T = decoder(bytes.slice(next))
      descriptions.push(decoded)
      next += encoder(decoded).length
    }

    return descriptions
  }

  public decodeOutputDescription(bytes: Buffer): TezosSaplingOutputDescription {
    return {
      cm: bytes.slice(0, 32) /* 32 bytes */,
      proof: bytes.slice(32, 224) /* 48 + 96 + 48 bytes */,
      ciphertext: this.decodeCiphertext(bytes.slice(224))
    }
  }

  public decodeCiphertext(bytes: Buffer): TezosSaplingCiphertext {
    const cv: Buffer = bytes.slice(0, 32) /* 32 xbytes */
    const epk: Buffer = bytes.slice(32, 64) /* 32 bytes */

    const payloadEncLength: number = bytes.readInt32BE(64)
    const payloadEncStart: number = 68
    const payloadEncEnd: number = payloadEncStart + payloadEncLength
    const payloadEnc: Buffer = bytes.slice(payloadEncStart, payloadEncEnd)

    const nonceEncStart: number = payloadEncEnd
    const nonceEncEnd: number = nonceEncStart + 24 /* 24 bytes */
    const nonceEnc: Buffer = bytes.slice(nonceEncStart, nonceEncEnd)

    const payloadOutStart: number = nonceEncEnd
    const payloadOutEnd: number = payloadOutStart + 32 + 32 + 16
    const payloadOut: Buffer = bytes.slice(payloadOutStart, payloadOutEnd)

    const nonceOutStart: number = payloadOutEnd
    const nonceOutEnd: number = nonceOutStart + 24 /* 24 bytes */
    const nonceOut: Buffer = bytes.slice(nonceOutStart, nonceOutEnd)

    return {
      cv: cv.toString('hex'),
      epk: epk.toString('hex'),
      payload_enc: payloadEnc.toString('hex'),
      nonce_enc: nonceEnc.toString('hex'),
      payload_out: payloadOut.toString('hex'),
      nonce_out: nonceOut.toString('hex')
    }
  }

  public decodeBalanceFromTransaction(transaction: Buffer): BigNumber {
    return this.decodeBalance(transaction.slice(-40).slice(0, 8))
  }

  private decodeBalance(encoded: Buffer): BigNumber {
    const hex: string = encoded.toString('hex')
    const bigNumber: BigNumber = new BigNumber(hex, 16)
    const msb: number = (parseInt(hex.slice(0, 2), 16) & 0xff) >> 7

    const isPositive: boolean = msb === 0

    return isPositive ? bigNumber : new BigNumber(2).pow(64).minus(bigNumber).negated()
  }
}
