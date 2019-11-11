// tslint:disable
// This needs to be imported first, otherwise the tests won't run anymore
import { EthereumProtocol } from './protocols/ethereum/EthereumProtocol'
// tslint:enable

import { IAirGapTransaction } from './interfaces/IAirGapTransaction'
import { IAirGapWallet } from './interfaces/IAirGapWallet'
import { AeternityProtocol } from './protocols/aeternity/AeternityProtocol'
import { BitcoinProtocol } from './protocols/bitcoin/BitcoinProtocol'
import { BitcoinTestnetProtocol } from './protocols/bitcoin/BitcoinTestnetProtocol'
import { CosmosProtocol } from './protocols/cosmos/CosmosProtocol'
import { GenericERC20, GenericERC20Configuration } from './protocols/ethereum/erc20/GenericERC20'
import { EthereumClassicProtocol } from './protocols/ethereum/EthereumClassicProtocol'
import { EthereumRopstenProtocol } from './protocols/ethereum/EthereumRopstenProtocol'
import { GroestlcoinProtocol } from './protocols/groestlcoin/GroestlcoinProtocol'
import { GroestlcoinTestnetProtocol } from './protocols/groestlcoin/GroestlcoinTestnetProtocol'
import { ICoinProtocol } from './protocols/ICoinProtocol'
import { ICoinSubProtocol } from './protocols/ICoinSubProtocol'
import { LitecoinProtocol } from './protocols/litecoin/LitecoinProtocol'
import { TezosKtProtocol } from './protocols/tezos/kt/TezosKtProtocol'
import { BakerInfo, DelegationInfo, DelegationRewardInfo, TezosProtocol } from './protocols/tezos/TezosProtocol'
import { ProtocolNotSupported, ProtocolVersionMismatch, SerializerVersionMismatch, TypeNotSupported } from './errors'
import { isCoinlibReady } from './utils/coinlibReady'
import { getProtocolByIdentifier } from './utils/protocolsByIdentifier'
import { addSubProtocol, getSubProtocolsByIdentifier } from './utils/subProtocols'
import { supportedProtocols } from './utils/supportedProtocols'
import { AirGapMarketWallet } from './wallet/AirGapMarketWallet'
import { AirGapWallet } from './wallet/AirGapWallet'

export {
  getProtocolByIdentifier,
  getSubProtocolsByIdentifier,
  supportedProtocols,
  AirGapWallet,
  AirGapMarketWallet,
  IAirGapWallet,
  IAirGapTransaction,
  ICoinProtocol,
  ICoinSubProtocol,
  BitcoinProtocol,
  BitcoinTestnetProtocol,
  GroestlcoinProtocol,
  GroestlcoinTestnetProtocol,
  LitecoinProtocol,
  EthereumProtocol,
  EthereumRopstenProtocol,
  EthereumClassicProtocol,
  GenericERC20,
  AeternityProtocol,
  TezosProtocol,
  TezosKtProtocol,
  CosmosProtocol,
  // tezos-specific configuration
  BakerInfo,
  DelegationRewardInfo,
  DelegationInfo,
  // sub protocols configs,
  GenericERC20Configuration,
  TypeNotSupported,
  SerializerVersionMismatch,
  ProtocolNotSupported,
  ProtocolVersionMismatch,
  // libsodium ready
  isCoinlibReady,
  // sub-protocols
  addSubProtocol
}
