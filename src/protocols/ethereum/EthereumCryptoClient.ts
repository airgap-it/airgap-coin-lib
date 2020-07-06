import * as EthereumJSUtils from '../../dependencies/src/ethereumjs-util-5.2.0/index'
import { CryptoClient } from '../CryptoClient'

import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EthereumInfoClient } from './clients/info-clients/InfoClient'
import { EthereumNodeClient } from './clients/node-clients/NodeClient'

export class EthereumCryptoClient extends CryptoClient {
  constructor(private readonly protocol: BaseEthereumProtocol<EthereumNodeClient, EthereumInfoClient>) {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    if (!keypair.privateKey) {
      throw new Error(`Private key not provided`)
    }

    const messageBuffer: Buffer = EthereumJSUtils.hashPersonalMessage(EthereumJSUtils.toBuffer(message))
    const signature: { v: string; r: string; s: string } = EthereumJSUtils.ecsign(messageBuffer, keypair.privateKey)

    return EthereumJSUtils.toRpcSig(signature.v, signature.r, signature.s)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    const msgBuffer: Buffer = EthereumJSUtils.toBuffer(message)
    const msgHash: string = EthereumJSUtils.hashPersonalMessage(msgBuffer)
    const signatureBuffer: Buffer = EthereumJSUtils.toBuffer(signature)
    const signatureParams: { v: string; r: string; s: string } = EthereumJSUtils.fromRpcSig(signatureBuffer)
    const recoveredPublicKey: Buffer = EthereumJSUtils.ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s)
    const recoveredAddressBuffer: Buffer = EthereumJSUtils.publicToAddress(recoveredPublicKey)
    const recoveredAddress: string = EthereumJSUtils.bufferToHex(recoveredAddressBuffer)

    const address: string = await this.protocol.getAddressFromPublicKey(publicKey)

    return recoveredAddress.toLowerCase() === address.toLowerCase()
  }
}
