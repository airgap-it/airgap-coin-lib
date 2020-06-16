import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { ICoinSubProtocol } from '../protocols/ICoinSubProtocol'

const subProtocolMapper: { [mainProtocolIdentifier: string]: { [subProtocolIdentifier: string]: ICoinSubProtocol } } = {}

const getSubProtocolsByIdentifier: (identifier: string) => ICoinSubProtocol[] = (identifier: string): ICoinSubProtocol[] => {
  if (subProtocolMapper[identifier]) {
    return Object.keys(subProtocolMapper[identifier]).map((key: string) => subProtocolMapper[identifier][key])
  }

  return []
}

const addSubProtocol: (protocol: ICoinProtocol, subProtocol: ICoinProtocol & ICoinSubProtocol) => void = (
  protocol: ICoinProtocol,
  subProtocol: ICoinProtocol & ICoinSubProtocol
): void => {
  if (!subProtocol.identifier.startsWith(protocol.identifier)) {
    throw new Error(`subprotocol ${subProtocol.name} is not supported for protocol ${protocol.identifier}`)
  }

  // make sure we can add subprotocols for this identifier
  if (!subProtocolMapper[protocol.identifier]) {
    subProtocolMapper[protocol.identifier] = {}
  }

  subProtocolMapper[protocol.identifier][subProtocol.identifier] = subProtocol
}

export { addSubProtocol, getSubProtocolsByIdentifier }
