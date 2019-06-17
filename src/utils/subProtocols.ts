import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { ICoinSubProtocol } from '../protocols/ICoinSubProtocol'

import { getProtocolByIdentifier } from './protocolsByIdentifier'

const subProtocolMapper = {}

const getSubProtocolsByIdentifier = (identifier: string) => {
  if (subProtocolMapper[identifier]) {
    return Object.keys(subProtocolMapper[identifier]).map(key => subProtocolMapper[identifier][key])
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
    subProtocolMapper[identifier] = {}
  }

  subProtocolMapper[identifier][subProtocol.identifier] = subProtocol
}

export { addSubProtocol, getSubProtocolsByIdentifier }
