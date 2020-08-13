// tslint:disable:no-console

import { ICoinProtocol } from '../../../src'

export const sign: (protocol: ICoinProtocol, mnemonic: string, message: string) => Promise<string> = async (
  protocol: ICoinProtocol,
  mnemonic: string,
  message: string
): Promise<string> => {
  const privateKey: Buffer = await protocol.getPrivateKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)
  const publicKey: string = await protocol.getPublicKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)

  const signature: string = await protocol.signMessage(message, {
    privateKey,
    publicKey
  })

  console.log(`The signature for the message "${message}" is "${signature}"`)

  return signature
}
