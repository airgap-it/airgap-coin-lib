import { AeternityProtocolOptions } from '../protocols/aeternity/AeternityProtocolOptions'
import { BitcoinProtocolOptions } from '../protocols/bitcoin/BitcoinProtocolOptions'
import { CosmosProtocolOptions } from '../protocols/cosmos/CosmosProtocolOptions'
import { EthereumProtocolOptions } from '../protocols/ethereum/EthereumProtocolOptions'
import { GroestlcoinProtocolOptions } from '../protocols/groestlcoin/GroestlcoinProtocolOptions'
import { KusamaProtocolOptions } from '../protocols/substrate/implementations/KusamaProtocolOptions'
import { PolkadotProtocolOptions } from '../protocols/substrate/implementations/PolkadotProtocolOptions'
import { TezosBTCProtocolConfig, TezosFAProtocolOptions, TezosStakerProtocolConfig } from '../protocols/tezos/fa/TezosFAProtocolOptions'
import { TezosProtocolNetwork, TezosProtocolOptions } from '../protocols/tezos/TezosProtocolOptions'
import { assertNever } from '../serializer/message'

import { ProtocolOptions } from './ProtocolOptions'
import { MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from './ProtocolSymbols'

const getProtocolOptionsByIdentifier: (identifier: ProtocolSymbols) => ProtocolOptions = (identifier: ProtocolSymbols): ProtocolOptions => {
  switch (identifier) {
    case MainProtocolSymbols.AE:
      return new AeternityProtocolOptions()
    case MainProtocolSymbols.BTC:
      return new BitcoinProtocolOptions()
    case MainProtocolSymbols.ETH:
    case SubProtocolSymbols.ETH_ERC20:
      return new EthereumProtocolOptions()
    case MainProtocolSymbols.GRS:
      return new GroestlcoinProtocolOptions()
    case MainProtocolSymbols.COSMOS:
      return new CosmosProtocolOptions()
    case MainProtocolSymbols.POLKADOT:
      return new PolkadotProtocolOptions()
    case MainProtocolSymbols.KUSAMA:
      return new KusamaProtocolOptions()
    case MainProtocolSymbols.XTZ:
    case SubProtocolSymbols.XTZ_KT:
      return new TezosProtocolOptions()
    case SubProtocolSymbols.XTZ_BTC:
      return new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosBTCProtocolConfig())
    case SubProtocolSymbols.XTZ_STKR:
      return new TezosFAProtocolOptions(new TezosProtocolNetwork(), new TezosStakerProtocolConfig())

    default:
      // Maybe we get an identifier of a sub-protocol that is not in the known list. In that case, get the options of the parent
      if ((identifier as string).includes('-')) {
        return getProtocolOptionsByIdentifier((identifier as string).split('-')[0] as any)
      }
      assertNever(identifier)
      throw new Error(`No protocol options found for ${identifier}`)
  }
}

export { getProtocolOptionsByIdentifier }
