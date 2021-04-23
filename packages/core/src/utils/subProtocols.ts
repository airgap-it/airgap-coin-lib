import { ConditionViolationError, UnsupportedError } from '../errors'
import { Domain } from '../errors/coinlib-error'
import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { ICoinSubProtocol } from '../protocols/ICoinSubProtocol'

import { isNetworkEqual } from './Network'
import { ProtocolNetwork } from './ProtocolNetwork'
import { getProtocolOptionsByIdentifier } from './protocolOptionsByIdentifier'
import { MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from './ProtocolSymbols'

const subProtocolMapper: {
  [mainProtocolIdentifier in MainProtocolSymbols]?: { [subProtocolIdentifier in SubProtocolSymbols]?: ICoinSubProtocol }
} = {}

const getProtocolAndNetworkIdentifier: (identifier: ProtocolSymbols, network: ProtocolNetwork) => string = (
  identifier: ProtocolSymbols,
  network: ProtocolNetwork
): string => {
  return `${identifier}:${network.identifier}`
}

const getSubProtocolsByIdentifier: (identifier: ProtocolSymbols, network?: ProtocolNetwork) => ICoinSubProtocol[] = (
  identifier: ProtocolSymbols,
  network?: ProtocolNetwork
): ICoinSubProtocol[] => {
  if (!identifier || typeof identifier !== 'string') {
    throw new ConditionViolationError(Domain.SUBPROTOCOLS, 'No protocol identifier provided')
  }

  const targetNetwork: ProtocolNetwork = network ? network : getProtocolOptionsByIdentifier(identifier).network

  const protocolAndNetworkIdentifier: string = getProtocolAndNetworkIdentifier(identifier, targetNetwork)

  if (subProtocolMapper[protocolAndNetworkIdentifier]) {
    return Object.keys(subProtocolMapper[protocolAndNetworkIdentifier]).map(
      (key: string) => subProtocolMapper[protocolAndNetworkIdentifier][key]
    )
  }

  return []
}

const addSubProtocol: (protocol: ICoinProtocol, subProtocol: ICoinSubProtocol) => void = (
  protocol: ICoinProtocol,
  subProtocol: ICoinSubProtocol
): void => {
  if (!subProtocol.identifier.startsWith(protocol.identifier)) {
    throw new UnsupportedError(Domain.SUBPROTOCOLS, `subprotocol ${subProtocol.name} is not supported for protocol ${protocol.identifier}`)
  }

  if (!isNetworkEqual(protocol.options.network, subProtocol.options.network)) {
    throw new ConditionViolationError(
      Domain.SUBPROTOCOLS,
      `subprotocol ${subProtocol.name} needs to have the same network as main protocol`
    )
  }

  const protocolAndNetworkIdentifier: string = getProtocolAndNetworkIdentifier(protocol.identifier, protocol.options.network)

  // make sure we can add subprotocols for this identifier
  if (!subProtocolMapper[protocolAndNetworkIdentifier]) {
    subProtocolMapper[protocolAndNetworkIdentifier] = {}
  }

  subProtocolMapper[protocolAndNetworkIdentifier][subProtocol.identifier] = subProtocol
}

const removeSubProtocol: (protocol: ICoinProtocol, subProtocol: ICoinSubProtocol) => void = (
  protocol: ICoinProtocol,
  subProtocol: ICoinSubProtocol
): void => {
  if (!subProtocol.identifier.startsWith(protocol.identifier)) {
    throw new UnsupportedError(Domain.SUBPROTOCOLS, `subprotocol ${subProtocol.name} is not supported for protocol ${protocol.identifier}`)
  }

  if (!isNetworkEqual(protocol.options.network, subProtocol.options.network)) {
    throw new ConditionViolationError(
      Domain.SUBPROTOCOLS,
      `subprotocol ${subProtocol.name} needs to have the same network as main protocol`
    )
  }

  const protocolAndNetworkIdentifier: string = getProtocolAndNetworkIdentifier(protocol.identifier, protocol.options.network)

  if (!subProtocolMapper[protocolAndNetworkIdentifier]) {
    return
  }

  delete subProtocolMapper[protocolAndNetworkIdentifier][subProtocol.identifier]
} // TODO: Add tests

export { addSubProtocol, removeSubProtocol, getSubProtocolsByIdentifier }
