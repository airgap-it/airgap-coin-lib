import { ICoinSubProtocol } from '../protocols/ICoinSubProtocol'
import { getProtocolByIdentifier } from './protocolsByIdentifier'
import { ICoinProtocol } from '../protocols/ICoinProtocol'

const subProtocolMapper = {}

const getSubProtocolByIdentifier = (identifier: string) => {
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

  if (!subProtocolMapper[identifier]) {
    subProtocolMapper[identifier] = []
  }

  subProtocolMapper[identifier].push(subProtocol)
}

export { addSubProtocol, getSubProtocolByIdentifier }
