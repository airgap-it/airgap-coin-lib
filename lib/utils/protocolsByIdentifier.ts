import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { supportedProtocols } from './supportedProtocols'

const getProtocolByIdentifier = function(identifier: string): ICoinProtocol {
  for (let coinProtocol of supportedProtocols()) {
    if (coinProtocol.identifier === identifier) {
      return coinProtocol
    }
  }
  throw new Error('protocol not supported')
}

export { getProtocolByIdentifier }
