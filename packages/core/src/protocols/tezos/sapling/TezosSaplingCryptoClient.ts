import * as sapling from '@airgap/sapling-wasm'
import { SaplingPartialOutputDescription } from '@airgap/sapling-wasm'
import sodium = require('libsodium-wrappers')

import BigNumber from '../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { blake2bAsBytes } from '../../../utils/blake2b'
import { toHexBuffer } from '../../../utils/hex'
import { Ed25519CryptoClient } from '../../Ed25519CryptoClient'
import { TezosCryptoClient } from '../TezosCryptoClient'
import { TezosSaplingCiphertext } from '../types/sapling/TezosSaplingCiphertext'
import { TezosSaplingOutput } from '../types/sapling/TezosSaplingOutput'

import { TezosSaplingAddress } from './TezosSaplingAddress'

interface PayloadEnc {
  diversifier: Buffer
  address: Buffer
  amount: BigNumber
  rcm: Buffer
  memo: Buffer
}

interface PayloadOut {
  pkd: Buffer
  esk: Buffer
}
export class TezosSaplingCryptoClient extends Ed25519CryptoClient {
  private readonly ockKey: string = 'OCK_keystringderivation_TEZOS'
  private readonly kdfKey: string = 'KDFSaplingForTezosV1'

  constructor(private readonly tezosCryptoClient: TezosCryptoClient) {
    super()
  }

  public signMessage(message: string, keypair: { publicKey?: string | undefined; privateKey: Buffer }): Promise<string> {
    return this.tezosCryptoClient.signMessage(message, keypair)
  }

  public verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return this.tezosCryptoClient.verifyMessage(message, signature, publicKey)
  }

  public async encryptCiphertext(
    tezosOutput: TezosSaplingOutput,
    saplingDescription: SaplingPartialOutputDescription,
    rcm: Buffer,
    esk: Buffer,
    viewingKey?: Buffer
  ): Promise<TezosSaplingCiphertext> {
    await sodium.ready

    const address: TezosSaplingAddress = await TezosSaplingAddress.fromValue(tezosOutput.address)
    const [ovk, diversifier, pkd]: [Buffer | undefined, Buffer, Buffer] = await Promise.all([
      viewingKey !== undefined ? sapling.getOutgoingViewingKey(viewingKey) : undefined,
      sapling.getDiversifiedFromRawPaymentAddress(address.raw),
      sapling.getPkdFromRawPaymentAddress(address.raw)
    ])

    const symKey: Buffer = await this.getSymmetricKey(pkd, esk)
    const nonceEnc: Uint8Array = sodium.randombytes_buf(24)
    const plaintextEnc: Buffer = Buffer.concat([
      diversifier,
      toHexBuffer(new BigNumber(tezosOutput.value), 64),
      rcm,
      toHexBuffer(tezosOutput.memo.length, 32),
      Buffer.from(tezosOutput.memo, 'hex')
    ])
    const payloadEnc: Uint8Array = sodium.crypto_secretbox_easy(plaintextEnc, nonceEnc, symKey)

    const epk: Buffer = await sapling.deriveEphemeralPublicKey(diversifier, esk)
    const ock: Uint8Array =
      ovk !== undefined
        ? blake2bAsBytes(Buffer.concat([saplingDescription.cv, saplingDescription.cm, epk, ovk]), 256, {
            key: Buffer.from(this.ockKey)
          })
        : sodium.randombytes_buf(32)

    const nonceOut: Uint8Array = sodium.randombytes_buf(24)
    const plaintextOut: Buffer = Buffer.concat([pkd, esk])
    const payloadOut: Uint8Array = sodium.crypto_secretbox_easy(plaintextOut, nonceOut, ock)

    return {
      cv: saplingDescription.cv.toString('hex'),
      epk: epk.toString('hex'),
      payload_enc: Buffer.from(payloadEnc).toString('hex'),
      nonce_enc: Buffer.from(nonceEnc).toString('hex'),
      payload_out: Buffer.from(payloadOut).toString('hex'),
      nonce_out: Buffer.from(nonceOut).toString('hex')
    }
  }

  public async decryptCiphertextEnc(
    viewingKey: Buffer | string,
    ciphertext: TezosSaplingCiphertext,
    mode: 'sender' | 'receiver' = 'receiver',
    commitment?: Buffer | string
  ): Promise<PayloadEnc> {
    await sodium.ready

    let symKey: Buffer
    let rawAddressFromDiversifier: (diversifier: Buffer) => Promise<Buffer>
    if (mode === 'receiver') {
      const ivk: Buffer = await sapling.getIncomingViewingKey(viewingKey)
      symKey = await this.getSymmetricKey(ciphertext.epk, ivk)
      rawAddressFromDiversifier = (diversifier: Buffer) => sapling.getRawPaymentAddressFromIncomingViewingKey(ivk, diversifier)
    } else if (mode === 'sender' && commitment !== undefined) {
      const { pkd, esk }: PayloadOut = await this.decryptCiphertextOut(viewingKey, ciphertext, commitment)
      symKey = await this.getSymmetricKey(pkd, esk)
      rawAddressFromDiversifier = (diversifier: Buffer) => Promise.resolve(Buffer.concat([diversifier, pkd]))
    } else {
      throw new Error('Not enough data has been provided to decrypt the ciphertext')
    }

    const decrypted: Buffer = Buffer.from(
      sodium.crypto_secretbox_open_easy(Buffer.from(ciphertext.payload_enc, 'hex'), Buffer.from(ciphertext.nonce_enc, 'hex'), symKey)
    )

    const diversifier: Buffer = decrypted.slice(0, 11)
    const amount: BigNumber = new BigNumber(decrypted.slice(11, 19).toString('hex'), 16)
    const rcm: Buffer = decrypted.slice(19, 51)
    const memo: Buffer = decrypted.slice(51)

    return {
      diversifier,
      address: await rawAddressFromDiversifier(diversifier),
      amount,
      rcm,
      memo
    }
  }

  public async decryptCiphertextOut(
    viewingKey: Buffer | string,
    ciphertext: TezosSaplingCiphertext,
    commitment: Buffer | string
  ): Promise<PayloadOut> {
    await sodium.ready

    const ovk: Buffer = await sapling.getOutgoingViewingKey(viewingKey)

    const cv: Buffer = Buffer.from(ciphertext.cv, 'hex')
    const cm: Buffer = Buffer.isBuffer(commitment) ? commitment : Buffer.from(commitment, 'hex')
    const epk: Buffer = Buffer.from(ciphertext.epk, 'hex')
    const ock: Uint8Array = blake2bAsBytes(Buffer.concat([cv, cm, epk, ovk]), 256, {
      key: Buffer.from(this.ockKey)
    })

    const decrypted: Buffer = Buffer.from(
      sodium.crypto_secretbox_open_easy(Buffer.from(ciphertext.payload_out, 'hex'), Buffer.from(ciphertext.nonce_out, 'hex'), ock)
    )

    const pkd: Buffer = decrypted.slice(0, 32)
    const esk: Buffer = decrypted.slice(32)

    return { pkd, esk }
  }

  private async getSymmetricKey(p: Buffer | Uint8Array | string, sk: Buffer | Uint8Array | string): Promise<Buffer> {
    const ka: Buffer = await sapling.keyAgreement(p, sk)

    return Buffer.from(blake2bAsBytes(ka, 256, { key: Buffer.from(this.kdfKey) }))
  }
}
