import { AeternityProtocol } from '../protocols/aeternity/AeternityProtocol'
import { AeternityProtocolOptions } from '../protocols/aeternity/AeternityProtocolOptions'
import { BitcoinProtocol } from '../protocols/bitcoin/BitcoinProtocol'
import { BitcoinProtocolOptions } from '../protocols/bitcoin/BitcoinProtocolOptions'
import { BitcoinSegwitProtocol } from '../protocols/bitcoin/BitcoinSegwitProtocol'
import { CosmosProtocol } from '../protocols/cosmos/CosmosProtocol'
import { CosmosProtocolOptions } from '../protocols/cosmos/CosmosProtocolOptions'
import { ERC20Token } from '../protocols/ethereum/erc20/ERC20'
import { GenericERC20 } from '../protocols/ethereum/erc20/GenericERC20'
import { EthereumProtocol } from '../protocols/ethereum/EthereumProtocol'
import {
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  EthereumProtocolNetwork,
  EthereumProtocolOptions
} from '../protocols/ethereum/EthereumProtocolOptions'
import { GroestlcoinProtocol } from '../protocols/groestlcoin/GroestlcoinProtocol'
import { GroestlcoinProtocolOptions } from '../protocols/groestlcoin/GroestlcoinProtocolOptions'
import { ICoinProtocol } from '../protocols/ICoinProtocol'
import { AstarProtocol } from '../protocols/substrate/astar/AstarProtocol'
import { AstarProtocolOptions } from '../protocols/substrate/astar/AstarProtocolOptions'
import { ShidenProtocol } from '../protocols/substrate/astar/shiden/ShidenProtocol'
import { ShidenProtocolOptions } from '../protocols/substrate/astar/shiden/ShidenProtocolOptions'
import { KusamaProtocol } from '../protocols/substrate/kusama/KusamaProtocol'
import { KusamaProtocolOptions } from '../protocols/substrate/kusama/KusamaProtocolOptions'
import { MoonbaseProtocol } from '../protocols/substrate/moonbeam/moonbase/MoonbaseProtocol'
import { MoonbaseProtocolOptions } from '../protocols/substrate/moonbeam/moonbase/MoonbaseProtocolOptions'
import { MoonbeamProtocol } from '../protocols/substrate/moonbeam/MoonbeamProtocol'
import { MoonbeamProtocolOptions } from '../protocols/substrate/moonbeam/MoonbeamProtocolOptions'
import { MoonriverProtocol } from '../protocols/substrate/moonbeam/moonriver/MoonriverProtocol'
import { MoonriverProtocolOptions } from '../protocols/substrate/moonbeam/moonriver/MoonriverProtocolOptions'
import { PolkadotProtocol } from '../protocols/substrate/polkadot/PolkadotProtocol'
import { PolkadotProtocolOptions } from '../protocols/substrate/polkadot/PolkadotProtocolOptions'
import { TezosBTC } from '../protocols/tezos/fa/TezosBTC'
import { TezosBTCTez } from '../protocols/tezos/fa/TezosBTCtez'
import { TezosCTez } from '../protocols/tezos/fa/TezosCTez'
import { TezosDOGA } from '../protocols/tezos/fa/TezosDOGA'
import { TezosETHtz } from '../protocols/tezos/fa/TezosETHtz'
import { TezosFA1p2Protocol } from '../protocols/tezos/fa/TezosFA1p2Protocol'
import { TezosFA2Protocol } from '../protocols/tezos/fa/TezosFA2Protocol'
import { TezosFA2ProtocolOptions, TezosFAProtocolOptions } from '../protocols/tezos/fa/TezosFAProtocolOptions'
import { TezosKolibriUSD } from '../protocols/tezos/fa/TezosKolibriUSD'
import { TezosPlenty } from '../protocols/tezos/fa/TezosPlanty'
import { TezosQUIPU } from '../protocols/tezos/fa/TezosQUIPU'
import { TezosSIRS } from '../protocols/tezos/fa/TezosSIRS'
import { TezosStaker } from '../protocols/tezos/fa/TezosStaker'
import { TezosUBTC } from '../protocols/tezos/fa/TezosUBTC'
import { TezosUDEFI } from '../protocols/tezos/fa/TezosUDEFI'
import { TezosUSD } from '../protocols/tezos/fa/TezosUSD'
import { TezosUSDT } from '../protocols/tezos/fa/TezosUSDT'
import { TezosUUSD } from '../protocols/tezos/fa/TezosUUSD'
import { TezosWRAP } from '../protocols/tezos/fa/TezosWRAP'
import { TezosWrapped } from '../protocols/tezos/fa/TezosWrapped'
import { TezosYOU } from '../protocols/tezos/fa/TezosYOU'
import { TezosKtProtocol } from '../protocols/tezos/kt/TezosKtProtocol'
import { TezosSaplingProtocolOptions } from '../protocols/tezos/sapling/TezosSaplingProtocolOptions'
import { TezosShieldedTezProtocol } from '../protocols/tezos/sapling/TezosShieldedTezProtocol'
import { TezosProtocol } from '../protocols/tezos/TezosProtocol'
import { TezosProtocolOptions } from '../protocols/tezos/TezosProtocolOptions'

import { ProtocolOptions } from './ProtocolOptions'
import { MainProtocolSymbols, SubProtocolSymbols } from './ProtocolSymbols'

enum GenericSubProtocolSymbol {
  XTZ_FA1p2 = 'xtz-fa1.2',
  XTZ_FA2 = 'xtz-fa2'
}

// tslint:disable-next-line: cyclomatic-complexity
export const createProtocolByIdentifier: (identifier: string, options?: ProtocolOptions) => ICoinProtocol = (
  identifier: string,
  options?: ProtocolOptions
): ICoinProtocol => {
  switch (identifier) {
    case MainProtocolSymbols.AE:
      return new AeternityProtocol(options as AeternityProtocolOptions)
    case MainProtocolSymbols.BTC:
      return new BitcoinProtocol(options as BitcoinProtocolOptions)
    case MainProtocolSymbols.BTC_SEGWIT:
      return new BitcoinSegwitProtocol(options as BitcoinProtocolOptions)
    case MainProtocolSymbols.ETH:
      return new EthereumProtocol(options as EthereumProtocolOptions)
    case MainProtocolSymbols.XTZ:
      return new TezosProtocol(options as TezosProtocolOptions)
    case MainProtocolSymbols.XTZ_SHIELDED:
      return new TezosShieldedTezProtocol(options as TezosSaplingProtocolOptions)
    case MainProtocolSymbols.GRS:
      return new GroestlcoinProtocol(options as GroestlcoinProtocolOptions)
    case MainProtocolSymbols.COSMOS:
      return new CosmosProtocol(options as CosmosProtocolOptions)
    case MainProtocolSymbols.POLKADOT:
      return new PolkadotProtocol(options as PolkadotProtocolOptions)
    case MainProtocolSymbols.KUSAMA:
      return new KusamaProtocol(options as KusamaProtocolOptions)
    case MainProtocolSymbols.MOONBASE:
      return new MoonbaseProtocol(options as MoonbaseProtocolOptions)
    case MainProtocolSymbols.MOONRIVER:
      return new MoonriverProtocol(options as MoonriverProtocolOptions)
    case MainProtocolSymbols.MOONBEAM:
      return new MoonbeamProtocol(options as MoonbeamProtocolOptions)
    case MainProtocolSymbols.ASTAR:
      return new AstarProtocol(options as AstarProtocolOptions)
    case MainProtocolSymbols.SHIDEN:
      return new ShidenProtocol(options as ShidenProtocolOptions)
    case SubProtocolSymbols.XTZ_KT:
      return new TezosKtProtocol(options as TezosProtocolOptions)
    case SubProtocolSymbols.XTZ_BTC:
      return new TezosBTC(options as TezosFAProtocolOptions)
    case SubProtocolSymbols.XTZ_USD:
      return new TezosUSD(options as TezosFAProtocolOptions)
    case SubProtocolSymbols.XTZ_KUSD:
      return new TezosKolibriUSD(options as TezosFAProtocolOptions)
    case SubProtocolSymbols.XTZ_STKR:
      return new TezosStaker(options as TezosFAProtocolOptions)
    case SubProtocolSymbols.XTZ_ETHTZ:
      return new TezosETHtz(options as TezosFAProtocolOptions)
    case SubProtocolSymbols.XTZ_UUSD:
      return new TezosUUSD(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_YOU:
      return new TezosYOU(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_W:
      return new TezosWrapped(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_UDEFI:
      return new TezosUDEFI(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_UBTC:
      return new TezosUBTC(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_CTEZ:
      return new TezosCTez(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_PLENTY:
      return new TezosPlenty(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_WRAP:
      return new TezosWRAP(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_QUIPU:
      return new TezosQUIPU(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_DOGA:
      return new TezosDOGA(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_BTC_TEZ:
      return new TezosBTCTez(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_USDT:
      return new TezosUSDT(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.XTZ_SIRS:
      return new TezosSIRS(options as TezosFA2ProtocolOptions)
    case SubProtocolSymbols.ETH_ERC20:
      return ERC20Token
    case SubProtocolSymbols.ETH_ERC20_XCHF:
      const xchfOptions: EthereumERC20ProtocolOptions = options
        ? (options as EthereumERC20ProtocolOptions)
        : new EthereumERC20ProtocolOptions(
            new EthereumProtocolNetwork(),
            new EthereumERC20ProtocolConfig(
              'XCHF',
              'CryptoFranc',
              'xchf',
              SubProtocolSymbols.ETH_ERC20_XCHF,
              '0xB4272071eCAdd69d933AdcD19cA99fe80664fc08',
              18
            )
          )

      return new GenericERC20(xchfOptions)
    default:
      if (identifier.startsWith(SubProtocolSymbols.ETH_ERC20)) {
        return new GenericERC20(options as EthereumERC20ProtocolOptions)
      } else if (identifier.startsWith(GenericSubProtocolSymbol.XTZ_FA1p2)) {
        return new TezosFA1p2Protocol(options as TezosFAProtocolOptions)
      } else if (identifier.startsWith(GenericSubProtocolSymbol.XTZ_FA2)) {
        return new TezosFA2Protocol(options as TezosFA2ProtocolOptions)
      } else {
        throw new Error(`Unkown protocol identifier ${identifier}.`)
      }
  }
}
