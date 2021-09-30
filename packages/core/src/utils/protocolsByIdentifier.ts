import { InvalidValueError, ProtocolNotSupported } from '../errors'
import { Domain } from '../errors/coinlib-error'
import { ICoinProtocol } from '../protocols/ICoinProtocol'

import { isNetworkEqual } from './Network'
import { ProtocolNetwork } from './ProtocolNetwork'
import { getProtocolOptionsByIdentifier } from './protocolOptionsByIdentifier'
import { ProtocolSymbols } from './ProtocolSymbols'
import { supportedProtocols } from './supportedProtocols'

export const getProtocolByIdentifier: (identifier: ProtocolSymbols, network?: ProtocolNetwork) => ICoinProtocol = (
  identifier: ProtocolSymbols,
  network?: ProtocolNetwork
): ICoinProtocol => {
  if (!identifier || typeof identifier !== 'string') {
    throw new InvalidValueError(Domain.UTILS, 'No protocol identifier provided')
  }

  const targetNetwork: ProtocolNetwork = network ? network : getProtocolOptionsByIdentifier(identifier).network

  // create a complete list of all protocols and subprotocols
  const candidates: ICoinProtocol[] = supportedProtocols()
    .map((protocol: ICoinProtocol) => {
      const protocols: ICoinProtocol[] = [protocol]
      if (protocol.subProtocols) {
        protocols.push(...protocol.subProtocols)
      }

      return protocols
    })
    .reduce((current: ICoinProtocol[], next: ICoinProtocol[]) => current.concat(next), [])

  // filter out potential candidates, those where our identifier startsWith the identifier of the protocol
  const filteredCandidates: ICoinProtocol[] = candidates.filter(
    (protocol: ICoinProtocol) => identifier === protocol.identifier && isNetworkEqual(protocol.options.network, targetNetwork)
  )
  if (filteredCandidates.length === 0) {
    throw new ProtocolNotSupported()
  }

  // sort by length
  filteredCandidates.sort((a: ICoinProtocol, b: ICoinProtocol) => {
    return b.identifier.length - a.identifier.length
  })

  return filteredCandidates[0]
}
