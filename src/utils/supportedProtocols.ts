import { ICoinProtocol } from '../protocols/ICoinProtocol'

import { ChainNetwork, isNetworkEqual } from './Network'

const protocols: ICoinProtocol[] = []

const supportedProtocols: () => ICoinProtocol[] = (): ICoinProtocol[] => {
  return protocols
}

const addSupportedProtocol: (newProtocol: ICoinProtocol, network: ChainNetwork) => void = (
  newProtocol: ICoinProtocol,
  network: ChainNetwork
): void => {
  if (
    supportedProtocols().find(
      (protocolWrapper: ICoinProtocol) =>
        protocolWrapper.identifier === newProtocol.identifier && isNetworkEqual(protocolWrapper.chainNetwork, network)
    )
  ) {
    throw new Error(`protocol ${newProtocol.name} on network ${network.type}(${network.rpcUrl}) already exists`)
  }

  protocols.push(newProtocol)
}

export { addSupportedProtocol, supportedProtocols }
