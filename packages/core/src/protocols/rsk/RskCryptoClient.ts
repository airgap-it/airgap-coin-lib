// TODO: Use RskUtils
import * as EthereumJSUtils from '../../dependencies/src/ethereumjs-util-5.2.0/index'
import { NotFoundError } from '../../errors'
import { Domain } from '../../errors/coinlib-error'
import { Secp256k1CryptoClient } from '../Secp256k1CryptoClient'

import { BaseRskProtocol } from './BaseRskProtocol'
import { RskInfoClient } from './clients/info-clients/InfoClient'
import { RskNodeClient } from './clients/node-clients/RskNodeClient'
import { RskAddress } from './RskAddress'

export class RskCryptoClient extends Secp256k1CryptoClient {
  constructor(private readonly protocol: BaseRskProtocol<RskNodeClient, RskInfoClient>) {
    super()
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    if (!keypair.privateKey) {
      throw new NotFoundError(Domain.RSK, `Private key not provided`)
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

    const address: RskAddress = await this.protocol.getAddressFromPublicKey(publicKey)

    return recoveredAddress.toLowerCase() === address.getValue().toLowerCase()
  }
}
