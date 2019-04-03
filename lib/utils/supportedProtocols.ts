import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { BitcoinProtocol } from '../protocols/bitcoin/BitcoinProtocol'
import { GroestlcoinProtocol } from '../protocols/groestlcoin/GroestlcoinProtocol'
import { EthereumProtocol } from '../protocols/ethereum/EthereumProtocol'
import { AEProtocol } from '../protocols/aeternity/AEProtocol'
import { TezosProtocol } from '../protocols/tezos/TezosProtocol'

const protocols: ICoinProtocol[] = []

const supportedProtocols = function(): ICoinProtocol[] {
  if (protocols.length === 0) {
    // We cannot assign the protocols outside a function because the compiler complains
    // The reason is that we have a circular dependency in the EthereumProtocol.
    protocols.push(new BitcoinProtocol(), new GroestlcoinProtocol(), new EthereumProtocol(), new AEProtocol(), new TezosProtocol())
  }

  return protocols
}

const addSupportedProtocol = function(newProtocol: ICoinProtocol): void {
  if (supportedProtocols().find(protocol => protocol.identifier === newProtocol.identifier)) {
    throw new Error(`protocol ${newProtocol.name} already exists`)
  }

  protocols.push(newProtocol)
}

export { addSupportedProtocol, supportedProtocols }
