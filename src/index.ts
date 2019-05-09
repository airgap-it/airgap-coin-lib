// tslint:disable
import { EthereumProtocol } from './protocols/ethereum/EthereumProtocol'
// tslint:enable

import { IAirGapTransaction } from './interfaces/IAirGapTransaction'
import { IAirGapWallet } from './interfaces/IAirGapWallet'
import { AEProtocol } from './protocols/aeternity/AEProtocol'
import { BitcoinProtocol } from './protocols/bitcoin/BitcoinProtocol'
import { BitcoinTestnetProtocol } from './protocols/bitcoin/BitcoinTestnetProtocol'
import { GenericERC20, GenericERC20Configuration } from './protocols/ethereum/erc20/GenericERC20'
import { EthereumClassicProtocol } from './protocols/ethereum/EthereumClassicProtocol'
import { EthereumRopstenProtocol } from './protocols/ethereum/EthereumRopstenProtocol'
import { GroestlcoinProtocol } from './protocols/groestlcoin/GroestlcoinProtocol'
import { GroestlcoinTestnetProtocol } from './protocols/groestlcoin/GroestlcoinTestnetProtocol'
import { ICoinProtocol } from './protocols/ICoinProtocol'
import { ICoinSubProtocol } from './protocols/ICoinSubProtocol'
import { LitecoinProtocol } from './protocols/litecoin/LitecoinProtocol'
import { BakerInfo, DelegationInfo, DelegationRewardInfo, TezosKtProtocol } from './protocols/tezos/kt/TezosKtProtocol'
import { TezosProtocol } from './protocols/tezos/TezosProtocol'
import { ZCashProtocol } from './protocols/zcash/ZCashProtocol'
import { ZCashTestnetProtocol } from './protocols/zcash/ZCashTestnetProtocol'
import { ProtocolNotSupported, ProtocolVersionMismatch, SerializerVersionMismatch, TypeNotSupported } from './serializer/errors'
import { DeserializedSyncProtocol, EncodedType, SyncProtocolUtils } from './serializer/serializer'
import { SignedTransaction } from './serializer/signed-transaction.serializer'
import { UnsignedTransaction } from './serializer/unsigned-transaction.serializer'
import { SyncWalletRequest } from './serializer/wallet-sync.serializer'
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
  ZCashProtocol,
  ZCashTestnetProtocol,
  EthereumProtocol,
  EthereumRopstenProtocol,
  EthereumClassicProtocol,
  GenericERC20,
  AEProtocol,
  TezosProtocol,
  TezosKtProtocol,
  // tezos-specific configuration
  BakerInfo,
  DelegationRewardInfo,
  DelegationInfo,
  // sub protocols configs,
  GenericERC20Configuration,
  // sync protocol
  SyncProtocolUtils,
  DeserializedSyncProtocol,
  SyncWalletRequest,
  UnsignedTransaction,
  SignedTransaction,
  EncodedType,
  TypeNotSupported,
  SerializerVersionMismatch,
  ProtocolNotSupported,
  ProtocolVersionMismatch,
  // libsodium ready
  isCoinlibReady,
  // sub-protocols
  addSubProtocol
}
