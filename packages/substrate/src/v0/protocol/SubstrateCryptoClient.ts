import { assert, u8aToU8a } from '@polkadot/util'
import { sr25519Sign, sr25519Verify, waitReady } from '@polkadot/wasm-crypto'

import { Sr25519CryptoClient } from '@airgap/coinlib-core/protocols/Sr25519CryptoClient'

export class SubstrateCryptoClient extends Sr25519CryptoClient {
  constructor() {
    super()
  }

  public async signMessage(message: string, keypair: { publicKey: string; privateKey: string }): Promise<string> {
    await waitReady()

    const privateKeyBuffer = Buffer.from(keypair.privateKey, 'hex')
    const publicKeyBuffer: Buffer = Buffer.from(keypair.publicKey, 'hex')
    assert(publicKeyBuffer?.length === 32, 'Expected a valid publicKey, 32-bytes')
    assert(privateKeyBuffer.length === 64, 'Expected a valid secretKey, 64-bytes')

    const messageU8a: Uint8Array = u8aToU8a(message)

    return `0x${Buffer.from(sr25519Sign(publicKeyBuffer, privateKeyBuffer, messageU8a)).toString('hex')}`
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    await waitReady()

    const messageU8a: Uint8Array = u8aToU8a(message)
    const publicKeyU8a: Uint8Array = u8aToU8a(Buffer.from(publicKey, 'hex'))
    const signatureU8a: Uint8Array = u8aToU8a(signature)

    return sr25519Verify(signatureU8a, messageU8a, publicKeyU8a)
  }
}
