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
        protocol.identifier === newProtocol.identifier && isNetworkEqual(protocol.options.network, newProtocol.options.network)
    )
  ) {
    throw new Error(
      `protocol ${newProtocol.name} on network ${newProtocol.options.network.type}(${newProtocol.options.network.rpcUrl}) already exists`
    )
  }

  protocols.push(newProtocol)
}

const removeSupportedProtocol: (protocolToRemove: ICoinProtocol) => void = (protocolToRemove: ICoinProtocol): void => {
  for (let index: number = 0; index < protocols.length; index++) {
    if (
      protocols[index].identifier === protocolToRemove.identifier &&
      isNetworkEqual(protocols[index].options.network, protocolToRemove.options.network)
    ) {
      protocols.splice(index, 1)
    }
  }
} // TODO: Add tests

export { addSupportedProtocol, removeSupportedProtocol, supportedProtocols }
