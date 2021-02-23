import { AeternityProtocolNetwork, AeternityProtocolOptions } from '../protocols/aeternity/AeternityProtocolOptions'
import { BitcoinProtocolNetwork, BitcoinProtocolOptions } from '../protocols/bitcoin/BitcoinProtocolOptions'
import { CosmosProtocolNetwork, CosmosProtocolOptions } from '../protocols/cosmos/CosmosProtocolOptions'
import { EthereumProtocolNetwork, EthereumProtocolOptions } from '../protocols/ethereum/EthereumProtocolOptions'
import { GroestlcoinProtocolNetwork, GroestlcoinProtocolOptions } from '../protocols/groestlcoin/GroestlcoinProtocolOptions'
import { KusamaProtocolNetwork, KusamaProtocolOptions } from '../protocols/substrate/implementations/KusamaProtocolOptions'
import { PolkadotProtocolNetwork, PolkadotProtocolOptions } from '../protocols/substrate/implementations/PolkadotProtocolOptions'
import {
  TezosBTCProtocolConfig,
  TezosETHtzProtocolConfig,
  TezosFAProtocolOptions,
  TezosStakerProtocolConfig,
  TezosUSDProtocolConfig,
  TezosWrappedProtocolConfig
} from '../protocols/tezos/fa/TezosFAProtocolOptions'
import { TezosProtocolNetwork, TezosProtocolOptions } from '../protocols/tezos/TezosProtocolOptions'
import { assertNever } from './assert'

import { ProtocolNetwork } from './ProtocolNetwork'
import { ProtocolOptions } from './ProtocolOptions'
import { MainProtocolSymbols, ProtocolSymbols, SubProtocolSymbols } from './ProtocolSymbols'

// tslint:disable:cyclomatic-complexity
const getProtocolOptionsByIdentifier: (identifier: ProtocolSymbols, network?: ProtocolNetwork) => ProtocolOptions = (
  identifier: ProtocolSymbols,
  network?: ProtocolNetwork
): ProtocolOptions => {
  switch (identifier) {
    case MainProtocolSymbols.AE:
      return new AeternityProtocolOptions(network ? (network as AeternityProtocolNetwork) : new AeternityProtocolNetwork())
    case MainProtocolSymbols.BTC:
      return new BitcoinProtocolOptions(network ? (network as BitcoinProtocolNetwork) : new BitcoinProtocolNetwork())
    case MainProtocolSymbols.ETH:
    case SubProtocolSymbols.ETH_ERC20_XCHF:
    case SubProtocolSymbols.ETH_ERC20:
      return new EthereumProtocolOptions(network ? (network as EthereumProtocolNetwork) : new EthereumProtocolNetwork())
    case MainProtocolSymbols.GRS:
      return new GroestlcoinProtocolOptions(network ? (network as GroestlcoinProtocolNetwork) : new GroestlcoinProtocolNetwork())
    case MainProtocolSymbols.COSMOS:
      return new CosmosProtocolOptions(network ? (network as CosmosProtocolNetwork) : new CosmosProtocolNetwork())
    case MainProtocolSymbols.POLKADOT:
      return new PolkadotProtocolOptions(network ? (network as PolkadotProtocolNetwork) : new PolkadotProtocolNetwork())
    case MainProtocolSymbols.KUSAMA:
      return new KusamaProtocolOptions(network ? (network as KusamaProtocolNetwork) : new KusamaProtocolNetwork())
    case MainProtocolSymbols.XTZ:
    case SubProtocolSymbols.XTZ_KT:
      return new TezosProtocolOptions(network ? (network as TezosProtocolNetwork) : new TezosProtocolNetwork())
    case SubProtocolSymbols.XTZ_BTC:
      return new TezosFAProtocolOptions(
        network ? (network as TezosProtocolNetwork) : new TezosProtocolNetwork(),
        new TezosBTCProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_ETHTZ:
      return new TezosFAProtocolOptions(
        network ? (network as TezosProtocolNetwork) : new TezosProtocolNetwork(),
        new TezosETHtzProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_W:
      return new TezosFAProtocolOptions(
        network ? (network as TezosProtocolNetwork) : new TezosProtocolNetwork(),
        new TezosWrappedProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_USD:
      return new TezosFAProtocolOptions(
        network ? (network as TezosProtocolNetwork) : new TezosProtocolNetwork(),
        new TezosUSDProtocolConfig()
      )
    case SubProtocolSymbols.XTZ_STKR:
      return new TezosFAProtocolOptions(
        network ? (network as TezosProtocolNetwork) : new TezosProtocolNetwork(),
        new TezosStakerProtocolConfig()
      )

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
