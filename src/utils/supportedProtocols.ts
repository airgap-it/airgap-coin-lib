import { ICoinProtocol } from '../protocols/ICoinProtocol'

import { isNetworkEqual } from './Network'

const protocols: ICoinProtocol[] = []

const supportedProtocols: () => ICoinProtocol[] = (): ICoinProtocol[] => {
  return protocols
}

const addSupportedProtocol: (newProtocol: ICoinProtocol) => void = (newProtocol: ICoinProtocol): void => {
  if (
    supportedProtocols().find(
      (protocol: ICoinProtocol) =>
        protocol.identifier === newProtocol.identifier && isNetworkEqual(protocol.chainNetwork, newProtocol.chainNetwork)
    )
  ) {
    throw new Error(
      `protocol ${newProtocol.name} on network ${newProtocol.chainNetwork.type}(${newProtocol.chainNetwork.rpcUrl}) already exists`
    )
  }

  protocols.push(newProtocol)
}

export { addSupportedProtocol, supportedProtocols }
