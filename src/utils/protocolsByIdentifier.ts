import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { ProtocolNotSupported } from '../errors'

import { supportedProtocols } from './supportedProtocols'

const getProtocolByIdentifier = function(identifier: string): ICoinProtocol {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('No protocol identifier provided')
  }
  // create a complete list of all protocols and subprotocols
  let candidates = supportedProtocols()
    .map(protocol => {
      const protocols = [protocol]
      if (protocol.subProtocols) {
        protocols.push(...protocol.subProtocols)
      }
      return protocols
    })
    .reduce((current, next) => current.concat(next))
  // filter out potential candidates, those where our identifier startsWith the identifier of the protocol
  const filteredCandidates = candidates.filter(protocol => identifier.startsWith(protocol.identifier))
  if (filteredCandidates.length === 0) {
    throw new ProtocolNotSupported()
  }

  // sort by length
  filteredCandidates.sort((a: ICoinProtocol, b: ICoinProtocol) => {
    return b.identifier.length - a.identifier.length
  })

  return filteredCandidates[0]
}

export { getProtocolByIdentifier }
