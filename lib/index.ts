import { BitcoinProtocol } from './protocols/bitcoin/BitcoinProtocol'
import { BitcoinTestnetProtocol } from './protocols/bitcoin/BitcoinTestnetProtocol'
import { LitecoinProtocol } from './protocols/litecoin/LitecoinProtocol'
import { ZCashProtocol } from './protocols/zcash/ZCashProtocol'
import { ZCashTestnetProtocol } from './protocols/zcash/ZCashTestnetProtocol'
import { EthereumProtocol } from './protocols/ethereum/EthereumProtocol'
import { EthereumRopstenProtocol } from './protocols/ethereum/EthereumRopstenProtocol'
import { EthereumClassicProtocol } from './protocols/ethereum/EthereumClassicProtocol'
import { GenericERC20, GenericERC20Configuration } from './protocols/ethereum/erc20/GenericERC20'
import { AEProtocol } from './protocols/aeternity/AEProtocol'
import { TezosProtocol } from './protocols/tezos/TezosProtocol'
import { TezosKtProtocol, BakerInfo, DelegationInfo, DelegationRewardInfo } from './protocols/tezos/kt/TezosKtProtocol'
import { AirGapWallet } from './wallet/AirGapWallet'
import { AirGapMarketWallet } from './wallet/AirGapMarketWallet'
import { IAirGapWallet } from './interfaces/IAirGapWallet'
import { IAirGapTransaction } from './interfaces/IAirGapTransaction'
import { ICoinProtocol } from './protocols/ICoinProtocol'
import { ICoinSubProtocol } from './protocols/ICoinSubProtocol'
import { SyncProtocolUtils, DeserializedSyncProtocol, EncodedType } from './serializer/serializer'
import { SyncWalletRequest } from './serializer/wallet-sync.serializer'
import { UnsignedTransaction } from './serializer/unsigned-transaction.serializer'
import { SignedTransaction } from './serializer/signed-transaction.serializer'
import { TypeNotSupported, SerializerVersionMismatch, ProtocolNotSupported, ProtocolVersionMismatch } from './serializer/errors'
import { getProtocolByIdentifier } from './utils/protocolsByIdentifier'
import { supportedProtocols } from './utils/supportedProtocols'
import { isCoinlibReady } from './utils/coinlibReady'
import { addSubProtocol, getSubProtocolsByIdentifier } from './utils/subProtocols'

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
