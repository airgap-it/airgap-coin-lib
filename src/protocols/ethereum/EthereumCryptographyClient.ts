import * as EthereumJSUtils from '../../dependencies/src/ethereumjs-util-5.2.0/index'
import { CryptographyClient } from '../CryptographyClient'

import { BaseEthereumProtocol } from './BaseEthereumProtocol'
import { EthereumInfoClient } from './clients/info-clients/InfoClient'
import { EthereumNodeClient } from './clients/node-clients/NodeClient'

export class EthereumCryptographyClient extends CryptographyClient {
  constructor(private readonly protocol: BaseEthereumProtocol<EthereumNodeClient, EthereumInfoClient>) {
    super()
  }

  public async signMessage(message: string, privateKey: Buffer): Promise<string> {
    const messageBuffer: Buffer = EthereumJSUtils.hashPersonalMessage(EthereumJSUtils.toBuffer(message))
    const signature: { v: string; r: string; s: string } = EthereumJSUtils.ecsign(messageBuffer, privateKey)

    return EthereumJSUtils.toRpcSig(signature.v, signature.r, signature.s)
  }

  public async verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
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
