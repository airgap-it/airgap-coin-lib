import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { BitcoinProtocol } from '../protocols/bitcoin/BitcoinProtocol'
import { EthereumProtocol } from '../protocols/ethereum/EthereumProtocol'
import { AEProtocol } from '../protocols/aeternity/AEProtocol'
import { TezosProtocol } from '../protocols/tezos/TezosProtocol'

const protocols: ICoinProtocol[] = [new BitcoinProtocol(), new EthereumProtocol(), new AEProtocol(), new TezosProtocol()]

const supportedProtocols = function(): ICoinProtocol[] {
  return protocols
}

const addSupportedProtocol = function(newProtocol: ICoinProtocol): void {
  if (protocols.find(protocol => protocol.identifier === newProtocol.identifier)) {
    throw new Error(`protocol ${newProtocol.name} already exists`)
  }

  protocols.push(newProtocol)
}

export { addSupportedProtocol, supportedProtocols }
