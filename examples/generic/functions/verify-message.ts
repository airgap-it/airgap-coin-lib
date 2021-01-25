// tslint:disable:no-console

import { ICoinProtocol } from '../../../packages/core/src'

export const verify: (protocol: ICoinProtocol, mnemonic: string, message: string, signature: string) => Promise<boolean> = async (
  protocol: ICoinProtocol,
  mnemonic: string,
  message: string,
  signature: string
): Promise<boolean> => {
  const publicKey: string = await protocol.getPublicKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)

  const isValid: boolean = await protocol.verifyMessage(message, signature, publicKey)

  console.log(`The signature "${signature}" for the message "${message}" is ${isValid ? 'valid' : 'invalid'}`)

  return isValid
}
