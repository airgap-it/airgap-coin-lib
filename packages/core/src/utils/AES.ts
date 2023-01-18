import * as crypto from 'crypto'
import { InvalidValueError, ConditionViolationError } from '../errors'
import { Domain } from '../errors/coinlib-error'
import { isHex } from './hex'

// https://github.com/microsoft/botbuilder-js/blob/master/libraries/botframework-config/src/encrypt.ts#L20
export class AES {
  constructor(
    public readonly AES_KEY_SIZE: number = 256,
    public readonly KEY_DERIVATION_ITERATION_COUNT: number = 10000,
    public readonly ALGORITHM: 'aes-256-gcm' = 'aes-256-gcm',
    public readonly encoding: 'base64' | 'hex' = 'hex'
  ) {}

  public async encryptString(plainText: string, privateKey: string): Promise<string> {
    if (!plainText || plainText.length === 0) {
      throw new ConditionViolationError(Domain.UTILS, 'you must pass an input message')
    }

    if (!privateKey || privateKey.length === 0) {
      throw new ConditionViolationError(Domain.UTILS, 'you must pass a privateKey')
    }

    const keyBytes: Buffer = await this.deriveKeyFromPrivateKey(privateKey)

    // Generates 16 byte cryptographically strong pseudo-random data as IV
    // https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback
    const ivBytes: Buffer = crypto.randomBytes(16)
    const ivText: string = ivBytes.toString(this.encoding)

    // encrypt using aes256 iv + key + plainText = encryptedText
    const cipher: crypto.CipherGCM = crypto.createCipheriv(this.ALGORITHM, keyBytes, ivBytes)
    let encryptedValue: string = cipher.update(plainText, 'utf8', this.encoding)
    encryptedValue += cipher.final(this.encoding)

    const authTagText: string = cipher.getAuthTag().toString(this.encoding)

    return `${ivText}!${encryptedValue}!${authTagText}`
  }

  public async decryptString(encryptedValue: string, privateKey: string): Promise<string> {
    if (!encryptedValue || encryptedValue.length === 0) {
      return encryptedValue
    }

    if (!privateKey || privateKey.length === 0) {
      throw new ConditionViolationError(Domain.UTILS, 'you must pass a privateKey')
    }

    const parts: string[] = encryptedValue.split('!')
    if (parts.length !== 3) {
      throw new ConditionViolationError(Domain.UTILS, 'The encrypted value is not in a valid format')
    }

    const ivText: string = parts[0]
    const encryptedText: string = parts[1]
    const authTagText: string = parts[2]

    const ivBytes: Buffer = Buffer.from(ivText, this.encoding)
    const keyBytes: Buffer = await this.deriveKeyFromPrivateKey(privateKey)
    const authTagBytes: Buffer = Buffer.from(authTagText, this.encoding)

    if (ivBytes.length !== 16) {
      throw new InvalidValueError(Domain.UTILS, 'The IV length is invalid')
    }

    if (keyBytes.length !== 32) {
      throw new InvalidValueError(Domain.UTILS, 'The key length is invalid')
    }

    if (authTagBytes.length !== 16) {
      throw new InvalidValueError(Domain.UTILS, 'The authtag length is invalid')
    }

    // decrypt using aes256 iv + key + authTag + encryptedText = decryptedText
    const decipher: crypto.DecipherGCM = crypto.createDecipheriv(this.ALGORITHM, keyBytes, ivBytes)
    decipher.setAuthTag(authTagBytes)

    let value: string = decipher.update(encryptedText, this.encoding, 'utf8')
    value += decipher.final('utf8')

    return value
  }

  private deriveKeyFromPrivateKey(privateKey: string): Promise<Buffer> {
    const password = isHex(privateKey) ? Buffer.from(privateKey, 'hex') : privateKey

    return new Promise((resolve: (value: Buffer | PromiseLike<Buffer>) => void, reject: (reason?: unknown) => void): void => {
      crypto.pbkdf2(password, '', this.KEY_DERIVATION_ITERATION_COUNT, 32, 'sha512', (pbkdf2Error: Error | null, key: Buffer) => {
        if (pbkdf2Error) {
          reject(pbkdf2Error)
        }
        resolve(key)
      })
    })
  }
}
