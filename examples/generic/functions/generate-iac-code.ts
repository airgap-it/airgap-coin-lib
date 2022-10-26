// tslint:disable:no-console
// tslint:disable:no-any

import { IACMessageDefinitionObject, IACMessageType, Serializer, generateId } from '../../../packages/serializer/src'
import { MainProtocolSymbols } from '../../../packages/core/src/utils/ProtocolSymbols'
import { ICoinProtocol } from '../../../packages/core/src'

export const generateIACCode: (
  protocol: ICoinProtocol,
  mnemonic: string,
  size?: number
) => Promise<{ message: IACMessageDefinitionObject; result: string[] }> = async (
  protocol: ICoinProtocol,
  mnemonic: string,
  size?: number
): Promise<{ message: IACMessageDefinitionObject; result: string[] }> => {
  const publicKey: string = await protocol.getPublicKeyFromMnemonic(mnemonic, protocol.standardDerivationPath)

  const accountShareMessage: IACMessageDefinitionObject = {
    id: generateId(10),
    type: IACMessageType.AccountShareResponse,
    protocol: protocol.identifier,
    payload: {
      publicKey,
      derivationPath: protocol.standardDerivationPath, // This could be replaced by the default derivation path
      isExtendedPublicKey: protocol.identifier === MainProtocolSymbols.BTC || protocol.identifier === MainProtocolSymbols.GRS
    }
  }

  const serializer: Serializer = new Serializer()

  const result: string[] = await serializer.serialize([accountShareMessage], size)

  return { message: accountShareMessage, result }
}
