import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { BitcoinProtocol } from '../protocols/bitcoin/BitcoinProtocol'
import { EthereumProtocol } from '../protocols/ethereum/EthereumProtocol'
import { AEProtocol } from '../protocols/aeternity/AEProtocol'
import { TezosProtocol } from '../protocols/tezos/TezosProtocol'

const supportedProtocols = function(): ICoinProtocol[] {
  return [new BitcoinProtocol(), new EthereumProtocol(), new AEProtocol(), new TezosProtocol()]
}

export { supportedProtocols }
