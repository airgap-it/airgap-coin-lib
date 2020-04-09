// tslint:disable
// This needs to be imported first, otherwise the tests won't run anymore
import { EthereumProtocol } from './protocols/ethereum/EthereumProtocol'
// tslint:enable

import { ProtocolNotSupported, ProtocolVersionMismatch, SerializerVersionMismatch, TypeNotSupported } from './errors'
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
import { ICoinDelegateProtocol } from './protocols/ICoinDelegateProtocol'
import { LitecoinProtocol } from './protocols/litecoin/LitecoinProtocol'
import { TezosKtProtocol } from './protocols/tezos/kt/TezosKtProtocol'
import { BakerInfo, DelegationInfo, DelegationRewardInfo, TezosProtocol, TezosPayoutInfo } from './protocols/tezos/TezosProtocol'
import { IACMessageType } from './serializer/interfaces'
import { IACMessageDefinitionObject } from './serializer/message'
import { AccountShareResponse } from './serializer/schemas/definitions/account-share-response'
import { MessageSignRequest } from './serializer/schemas/definitions/message-sign-request'
import { MessageSignResponse } from './serializer/schemas/definitions/message-sign-response'
import { UnsignedTransaction } from './serializer/schemas/definitions/transaction-sign-request'
import { UnsignedAeternityTransaction } from './serializer/schemas/definitions/transaction-sign-request-aeternity'
import { UnsignedBitcoinTransaction } from './serializer/schemas/definitions/transaction-sign-request-bitcoin'
import { UnsignedEthereumTransaction } from './serializer/schemas/definitions/transaction-sign-request-ethereum'
import { UnsignedTezosTransaction } from './serializer/schemas/definitions/transaction-sign-request-tezos'
import { SignedTransaction } from './serializer/schemas/definitions/transaction-sign-response'
import { SignedAeternityTransaction } from './serializer/schemas/definitions/transaction-sign-response-aeternity'
import { SignedBitcoinTransaction } from './serializer/schemas/definitions/transaction-sign-response-bitcoin'
import { SignedCosmosTransaction } from './serializer/schemas/definitions/transaction-sign-response-cosmos'
import { SignedEthereumTransaction } from './serializer/schemas/definitions/transaction-sign-response-ethereum'
import { SignedTezosTransaction } from './serializer/schemas/definitions/transaction-sign-response-tezos'
import { IACPayloadType, Serializer } from './serializer/serializer'
import { UnsignedCosmosTransaction } from './serializer/types'
import { isCoinlibReady } from './utils/coinlibReady'
import { getProtocolByIdentifier } from './utils/protocolsByIdentifier'
import { addSubProtocol, getSubProtocolsByIdentifier } from './utils/subProtocols'
import { addSupportedProtocol, supportedProtocols } from './utils/supportedProtocols'
import { AirGapMarketWallet } from './wallet/AirGapMarketWallet'
import { AirGapWallet } from './wallet/AirGapWallet'
import { TezosFAProtocol, TezosTransactionResult, TezosTransactionCursor } from './protocols/tezos/fa/TezosFAProtocol'
import { TezosBTC } from './protocols/tezos/fa/TezosBTC'
import { SubstrateProtocol } from './protocols/substrate/SubstrateProtocol'
import { SubstratePayee } from './protocols/substrate/data/staking/SubstratePayee'

export {
  addSupportedProtocol,
  getProtocolByIdentifier,
  getSubProtocolsByIdentifier,
  supportedProtocols,
  AirGapWallet,
  AirGapMarketWallet,
  IAirGapWallet,
  IAirGapTransaction,
  ICoinProtocol,
  ICoinSubProtocol,
  ICoinDelegateProtocol,
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
  TezosFAProtocol,
  TezosBTC,
  TezosTransactionResult,
  TezosTransactionCursor,
  CosmosProtocol,
  SubstrateProtocol,
  // tezos-specific configuration
  BakerInfo,
  DelegationRewardInfo,
  DelegationInfo,
  TezosPayoutInfo,
  // substrate specific
  SubstratePayee,
  // sub protocols configs,
  GenericERC20Configuration,
  TypeNotSupported,
  SerializerVersionMismatch,
  ProtocolNotSupported,
  ProtocolVersionMismatch,
  // libsodium ready
  isCoinlibReady,
  // sub-protocols
  addSubProtocol,
  // serializer
  IACMessageType,
  IACMessageDefinitionObject,
  AccountShareResponse,
  MessageSignRequest,
  MessageSignResponse,
  SignedTransaction,
  UnsignedTransaction,
  UnsignedAeternityTransaction,
  UnsignedBitcoinTransaction,
  UnsignedCosmosTransaction,
  UnsignedEthereumTransaction,
  UnsignedTezosTransaction,
  SignedAeternityTransaction,
  SignedBitcoinTransaction,
  SignedCosmosTransaction,
  SignedEthereumTransaction,
  SignedTezosTransaction,
  IACPayloadType,
  Serializer
}
