// @ts-ignore
import * as EthereumJSUtils from '@airgap/coinlib-core/dependencies/src/ethereumjs-util-5.2.0'
import { NotFoundError } from '@airgap/coinlib-core/errors'
import { Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import { Secp256k1CryptoClient } from '@airgap/coinlib-core/protocols/Secp256k1CryptoClient'
import { signTypedData, SignTypedDataVersion, TypedDataV1, TypedMessage } from '@metamask/eth-sig-util'

import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EthereumInfoClient } from './clients/info-clients/InfoClient'
import { EthereumNodeClient } from './clients/node-clients/NodeClient'
import { EthereumAddressResult } from './EthereumTypes'

export class EthereumCryptoClient extends Secp256k1CryptoClient {
  constructor(private readonly protocol: BaseEthereumProtocol<EthereumNodeClient, EthereumInfoClient>) {
    super()
  }

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

    const address: EthereumAddressResult = await this.protocol.getAddressFromPublicKey(publicKey)

    return recoveredAddress.toLowerCase() === address.address.toLowerCase()
  }
}
