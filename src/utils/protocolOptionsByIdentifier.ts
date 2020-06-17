import { AeternityProtocolOptions } from '../protocols/aeternity/AeternityProtocolOptions'
import { BitcoinProtocolOptions } from '../protocols/bitcoin/BitcoinProtocolOptions'
import { CosmosProtocolOptions } from '../protocols/cosmos/CosmosProtocolOptions'
import { EthereumProtocolOptions } from '../protocols/ethereum/EthereumProtocolOptions'
import { GroestlcoinProtocolOptions } from '../protocols/groestlcoin/GroestlcoinProtocolOptions'
import { KusamaProtocolOptions } from '../protocols/substrate/implementations/KusamaProtocolOptions'
import { PolkadotProtocolOptions } from '../protocols/substrate/implementations/PolkadotProtocolOptions'
import { TezosProtocolOptions } from '../protocols/tezos/TezosProtocolOptions'

import { ProtocolOptions } from './ProtocolOptions'

const getProtocolOptionsByIdentifier: (identifier: string) => ProtocolOptions = (identifier: string): ProtocolOptions => {
  switch (identifier) {
    case 'ae':
      return new AeternityProtocolOptions()
    case 'btc':
      return new BitcoinProtocolOptions()
    case 'eth':
      return new EthereumProtocolOptions()
    case 'grs':
      return new GroestlcoinProtocolOptions()
    case 'cosmos':
      return new CosmosProtocolOptions()
    case 'polkadot':
      return new PolkadotProtocolOptions()
    case 'kusama':
      return new KusamaProtocolOptions()
    case 'xtz':
      return new TezosProtocolOptions()

    default:
      throw new Error('No protocol options found')
  }
}

export { getProtocolOptionsByIdentifier }
