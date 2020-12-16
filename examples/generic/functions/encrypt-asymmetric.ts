// tslint:disable:no-console

import { ICoinProtocol } from '../../../src'

export const encryptAsymmetric: (protocol: ICoinProtocol, mnemonic: string, message: string) => Promise<string> = async (
  protocol: ICoinProtocol,
  mnemonic: string,
  message: string
): Promise<string> => {
  const publicKey: string = await protocol.getPublicKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)

  const encryptedPayload: string = await protocol.encryptAsymmetric(message, publicKey)

  console.log(`The encrypted payload for the message "${message}" is "${encryptedPayload}"`)

  return encryptedPayload
}
