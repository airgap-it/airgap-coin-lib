import { schnorrkelSign, signatureVerify } from '@polkadot/util-crypto'

import { SubstrateProtocol } from '../..'
import { CryptographyClient } from '../CryptographyClient'

export class SubstrateCryptographyClient extends CryptographyClient {
  constructor(private readonly protocol: SubstrateProtocol) {
    super()
  }

  public async signMessage(message: string, keypair: { publicKey: Buffer; privateKey: Buffer }): Promise<string> {
    const rawSignature: Uint8Array = schnorrkelSign(message, { publicKey: keypair.publicKey, secretKey: keypair.privateKey })

    return `0x${Buffer.from(rawSignature).toString('hex')}`
  }

  public async verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
    return signatureVerify(message, signature, await this.protocol.getAddressFromPublicKey(publicKey.toString('hex'))).isValid
  }
}
