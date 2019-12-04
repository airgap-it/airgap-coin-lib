import { ProtocolNotSupported } from '../errors'
import { ICoinProtocol } from '../protocols/ICoinProtocol'

import { supportedProtocols } from './supportedProtocols'

const getProtocolByIdentifier: (identifier: string) => ICoinProtocol = (identifier: string): ICoinProtocol => {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error('No protocol identifier provided')
  }
  // create a complete list of all protocols and subprotocols
  const candidates: ICoinProtocol[] = supportedProtocols()
    .map((protocol: ICoinProtocol) => {
      const protocols: ICoinProtocol[] = [protocol]
      if (protocol.subProtocols) {
        protocols.push(...protocol.subProtocols)
      }

      return protocols
    })
    .reduce((current: ICoinProtocol[], next: ICoinProtocol[]) => current.concat(next))
  // filter out potential candidates, those where our identifier startsWith the identifier of the protocol
  const filteredCandidates: ICoinProtocol[] = candidates.filter((protocol: ICoinProtocol) => identifier.startsWith(protocol.identifier))
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
