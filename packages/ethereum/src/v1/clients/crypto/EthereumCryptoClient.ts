import * as EthereumJSUtils from '@airgap/coinlib-core/dependencies/src/ethereumjs-util-5.2.0'
import { NotFoundError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { Secp256k1CryptoClient } from '@airgap/coinlib-core/protocols/Secp256k1CryptoClient'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { ExtendedPublicKey, newExtendedPublicKey, newPublicKey, PublicKey } from '@airgap/module-kit'
import { signTypedData, SignTypedDataVersion, TypedDataV1, TypedMessage } from '@metamask/eth-sig-util'

import { EthereumAddress } from '../../data/EthereumAddress'

export class EthereumCryptoClient extends Secp256k1CryptoClient {
  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    if (!keypair.privateKey) {
      throw new NotFoundError(Domain.ETHEREUM, `Private key not provided`)
    }

    const privateKey = Buffer.from(keypair.privateKey, 'hex')

    try {
      try {
        // v4 data supports arrays in the structure
        const msgParams = JSON.parse(message) as TypedMessage<any> // TODO types
        return signTypedData({ privateKey, data: msgParams, version: SignTypedDataVersion.V4 })
      } catch (e) {}
      try {
        // v3 does not support arrays in the structure
        const msgParams = JSON.parse(message) as TypedMessage<any> // TODO types
        return signTypedData({ privateKey, data: msgParams, version: SignTypedDataVersion.V3 })
      } catch (e) {}

      // v1 has a different structure than v3 and v4, it is an array
      const msgParams = JSON.parse(message) as TypedDataV1
      return signTypedData({ privateKey, data: msgParams, version: SignTypedDataVersion.V1 })
    } catch (error) {
      const messageBuffer: Buffer = EthereumJSUtils.hashPersonalMessage(EthereumJSUtils.toBuffer(message))
      const signature: { v: string; r: string; s: string } = EthereumJSUtils.ecsign(messageBuffer, privateKey)

      return EthereumJSUtils.toRpcSig(signature.v, signature.r, signature.s)
    }
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    const msgBuffer: Buffer = EthereumJSUtils.toBuffer(message)
    const msgHash: string = EthereumJSUtils.hashPersonalMessage(msgBuffer)
    const signatureBuffer: Buffer = EthereumJSUtils.toBuffer(signature)
    const signatureParams: { v: string; r: string; s: string } = EthereumJSUtils.fromRpcSig(signatureBuffer)
    const recoveredPublicKey: Buffer = EthereumJSUtils.ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s)
    const recoveredAddressBuffer: Buffer = EthereumJSUtils.publicToAddress(recoveredPublicKey)
    const recoveredAddress: string = EthereumJSUtils.bufferToHex(recoveredAddressBuffer)

    // TODO: use `PublicKey | ExtendedPublicKey` type
    const hexPublicKey: PublicKey | ExtendedPublicKey = isHex(publicKey)
      ? newPublicKey(publicKey, 'hex')
      : newExtendedPublicKey(publicKey, 'encoded')
    const address: EthereumAddress = EthereumAddress.from(hexPublicKey)

    return recoveredAddress.toLowerCase() === address.asString().toLowerCase()
  }
}
