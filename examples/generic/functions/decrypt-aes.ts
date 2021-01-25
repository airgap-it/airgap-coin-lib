// tslint:disable:no-console

import { ICoinProtocol } from '../../../packages/core/src'

export const decryptAES: (protocol: ICoinProtocol, mnemonic: string, message: string) => Promise<string> = async (
  protocol: ICoinProtocol,
  mnemonic: string,
  message: string
): Promise<string> => {
  const privateKey: string | Buffer =
    protocol.identifier === 'btc' || protocol.identifier === 'grs'
      ? await protocol.getExtendedPrivateKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)
      : await protocol.getPrivateKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)

  const decryptedPayload: string = await protocol.decryptAES(message, privateKey as any)

  console.log(`The decrypted payload is "${decryptedPayload}"`)

  return decryptedPayload
}
