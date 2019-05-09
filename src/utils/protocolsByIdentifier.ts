import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { supportedProtocols } from './supportedProtocols'
import { ProtocolNotSupported } from '../serializer/errors'

const getProtocolByIdentifier = function(identifier: string): ICoinProtocol {
  // create a complete list of all protocols and subprotocols
  let candidates: ICoinProtocol[] = [].concat.apply(
    [],
    supportedProtocols().map(protocol => {
      const protocols = [protocol]
      if (protocol.subProtocols) {
        protocols.push(...protocol.subProtocols)
      }

      return protocols
    })
  )

  // filter out potential candidates, those where our identifier startsWith the identifier of the protocol
  candidates = candidates.filter(protocol => identifier.startsWith(protocol.identifier))

  if (candidates.length === 0) {
    throw new ProtocolNotSupported()
  }

  // sort by length
  candidates.sort((a: ICoinProtocol, b: ICoinProtocol) => {
    return b.identifier.length - a.identifier.length
  })

  return candidates[0]
}

export { getProtocolByIdentifier }
