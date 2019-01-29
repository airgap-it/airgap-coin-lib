import { ICoinSubProtocol } from '../protocols/ICoinSubProtocol'
import { getProtocolByIdentifier } from './protocolsByIdentifier'
import { ICoinProtocol } from '../protocols/ICoinProtocol'

const subProtocolMapper = {}

const getSubProtocolsByIdentifier = (identifier: string) => {
  if (subProtocolMapper[identifier]) {
    return subProtocolMapper[identifier]
  }
  return []
}

const addSubProtocol = (identifier: string, subProtocol: ICoinProtocol & ICoinSubProtocol) => {
  const protocol = getProtocolByIdentifier(identifier)

  if (!subProtocol.identifier.startsWith(protocol.identifier)) {
    throw new Error(`subprotocol ${subProtocol.name} is not supported for protocol ${protocol.identifier}`)
  }

  // make sure we can add subprotocols for this identifier
  if (!subProtocolMapper[identifier]) {
    subProtocolMapper[identifier] = []
  }

  // only add sub-protocol if it doesn't exist yet
  if (subProtocolMapper[identifier].findIndex(sub => sub.identifier === subProtocol.identifier) !== -1) {
    subProtocolMapper[identifier].push(subProtocol)
  }
}

export { addSubProtocol, getSubProtocolsByIdentifier }
