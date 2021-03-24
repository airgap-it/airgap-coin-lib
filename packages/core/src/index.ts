// tslint:disable:ordered-imports
// This needs to be imported first, otherwise the tests won't run anymore
import { EthereumProtocol } from './protocols/ethereum/EthereumProtocol'

import { ProtocolNotSupported, ProtocolVersionMismatch, SerializerVersionMismatch, TypeNotSupported } from './errors'
import { IAirGapTransaction, IAirGapTransactionResult, IProtocolTransactionCursor } from './interfaces/IAirGapTransaction'
import { IAirGapWallet } from './interfaces/IAirGapWallet'
import { AeternityProtocol } from './protocols/aeternity/AeternityProtocol'
import { BitcoinProtocol } from './protocols/bitcoin/BitcoinProtocol'
import { BitcoinTestnetProtocol } from './protocols/bitcoin/BitcoinTestnetProtocol'
import { CosmosDelegationActionType, CosmosProtocol } from './protocols/cosmos/CosmosProtocol'
import { GenericERC20 } from './protocols/ethereum/erc20/GenericERC20'
import { EthereumClassicProtocol } from './protocols/ethereum/EthereumClassicProtocol'
import { EthereumRopstenProtocol } from './protocols/ethereum/EthereumRopstenProtocol'
import { GroestlcoinProtocol } from './protocols/groestlcoin/GroestlcoinProtocol'
import { GroestlcoinTestnetProtocol } from './protocols/groestlcoin/GroestlcoinTestnetProtocol'
import {
  DelegateeDetails,
  DelegatorAction,
  DelegatorDetails,
  DelegatorReward,
  ICoinDelegateProtocol
} from './protocols/ICoinDelegateProtocol'
import { FeeDefaults, ICoinProtocol } from './protocols/ICoinProtocol'
import { ICoinSubProtocol, SubProtocolType } from './protocols/ICoinSubProtocol'
import { SubstratePayee } from './protocols/substrate/helpers/data/staking/SubstratePayee'
import { KusamaProtocol } from './protocols/substrate/implementations/KusamaProtocol'
import { PolkadotProtocol } from './protocols/substrate/implementations/PolkadotProtocol'
import { SubstrateProtocol } from './protocols/substrate/SubstrateProtocol'
import { TezosBTC } from './protocols/tezos/fa/TezosBTC'
import { TezosFAProtocol } from './protocols/tezos/fa/TezosFAProtocol'
import { TezosStaker } from './protocols/tezos/fa/TezosStaker'
import { TezosKtProtocol } from './protocols/tezos/kt/TezosKtProtocol'
import { TezosUSD } from './protocols/tezos/fa/TezosUSD'
import {
  BakerInfo,
  DelegationInfo,
  DelegationRewardInfo,
  TezosDelegatorAction,
  TezosNetwork,
  TezosPayoutInfo,
  TezosProtocol
} from './protocols/tezos/TezosProtocol'
import { IACMessageType } from './serializer/interfaces'
import { IACMessageDefinitionObject, Message } from './serializer/message'
import { AccountShareResponse } from './serializer/schemas/definitions/account-share-response'
import { MessageSignRequest } from './serializer/schemas/definitions/message-sign-request'
import { MessageSignResponse } from './serializer/schemas/definitions/message-sign-response'
import { SignedTransaction } from './serializer/schemas/definitions/signed-transaction'
import { SignedAeternityTransaction } from './serializer/schemas/definitions/signed-transaction-aeternity'
import { SignedBitcoinTransaction } from './serializer/schemas/definitions/signed-transaction-bitcoin'
import { SignedCosmosTransaction } from './serializer/schemas/definitions/signed-transaction-cosmos'
import { SignedEthereumTransaction } from './serializer/schemas/definitions/signed-transaction-ethereum'
import { SignedTezosTransaction } from './serializer/schemas/definitions/signed-transaction-tezos'
import { UnsignedTransaction } from './serializer/schemas/definitions/unsigned-transaction'
import { UnsignedAeternityTransaction } from './serializer/schemas/definitions/unsigned-transaction-aeternity'
import { UnsignedBitcoinTransaction } from './serializer/schemas/definitions/unsigned-transaction-bitcoin'
import { UnsignedEthereumTransaction } from './serializer/schemas/definitions/unsigned-transaction-ethereum'
import { UnsignedTezosTransaction } from './serializer/schemas/definitions/unsigned-transaction-tezos'
import { IACPayloadType, Serializer } from './serializer/serializer'
import {
  RawAeternityTransaction,
  RawBitcoinTransaction,
  RawEthereumTransaction,
  RawSubstrateTransaction,
  RawTezosTransaction,
  UnsignedCosmosTransaction
} from './serializer/types'
import { isCoinlibReady } from './utils/coinlibReady'
import { isNetworkEqual } from './utils/Network'
import { getProtocolByIdentifier } from './utils/protocolsByIdentifier'
import { addSubProtocol, getSubProtocolsByIdentifier } from './utils/subProtocols'
import { getProtocolOptionsByIdentifier } from './utils/protocolOptionsByIdentifier'
import { addSupportedProtocol, supportedProtocols } from './utils/supportedProtocols'
import { AirGapMarketWallet, AirGapWalletPriceService, TimeInterval } from './wallet/AirGapMarketWallet'
import { AirGapWallet, SerializedAirGapWallet } from './wallet/AirGapWallet'
import { AeternityProtocolOptions, AeternalBlockExplorer, AeternityProtocolNetwork } from './protocols/aeternity/AeternityProtocolOptions'
import { AeternityCryptoClient } from './protocols/aeternity/AeternityCryptoClient'
import { BitcoinCryptoClient } from './protocols/bitcoin/BitcoinCryptoClient'
import {
  BitcoinProtocolNetworkExtras,
  BitcoinProtocolNetwork,
  BitcoinProtocolConfig,
  BlockcypherBlockExplorer,
  BitcoinProtocolOptions
} from './protocols/bitcoin/BitcoinProtocolOptions'
import { CosmosCryptoClient } from './protocols/cosmos/CosmosCryptoClient'
import {
  MintscanBlockExplorer,
  CosmosProtocolNetwork,
  CosmosProtocolConfig,
  CosmosProtocolOptions
} from './protocols/cosmos/CosmosProtocolOptions'
import { EthereumCryptoClient } from './protocols/ethereum/EthereumCryptoClient'
import { SubstrateCryptoClient } from './protocols/substrate/SubstrateCryptoClient'
import { TezosCryptoClient } from './protocols/tezos/TezosCryptoClient'
import {
  EthereumProtocolNetworkExtras,
  EtherscanBlockExplorer,
  EthereumProtocolNetwork,
  EthereumProtocolConfig,
  EthereumProtocolOptions,
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions
} from './protocols/ethereum/EthereumProtocolOptions'
import { ProtocolBlockExplorer } from './utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from './utils/ProtocolNetwork'
import {
  GroestlcoinProtocolNetworkExtras,
  CryptoidBlockExplorer,
  GroestlcoinProtocolNetwork,
  GroestlcoinProtocolConfig,
  GroestlcoinProtocolOptions
} from './protocols/groestlcoin/GroestlcoinProtocolOptions'
import {
  SubstrateProtocolNetworkExtras,
  PolkascanBlockExplorer,
  SubstrateProtocolConfig,
  SubstrateProtocolNetwork,
  SubstrateProtocolOptions
} from './protocols/substrate/SubstrateProtocolOptions'
import {
  KusamaProtocolNetworkExtras,
  KusamaPolkascanBlockExplorer,
  KusamaProtocolConfig,
  KusamaProtocolNetwork,
  KusamaProtocolOptions
} from './protocols/substrate/implementations/KusamaProtocolOptions'
import {
  PolkadotProtocolNetworkExtras,
  PolkadotPolkascanBlockExplorer,
  PolkadotProtocolConfig,
  PolkadotProtocolNetwork,
  PolkadotProtocolOptions
} from './protocols/substrate/implementations/PolkadotProtocolOptions'
import { CryptoClient } from './protocols/CryptoClient'
import {
  TezosProtocolNetworkExtras,
  TezblockBlockExplorer,
  TezosProtocolNetwork,
  TezosProtocolConfig,
  TezosProtocolOptions
} from './protocols/tezos/TezosProtocolOptions'
import {
  TezosFAProtocolConfig,
  TezosBTCProtocolConfig,
  TezosStakerProtocolConfig,
  TezosUSDProtocolConfig,
  TezosFAProtocolOptions,
  TezosFA2ProtocolConfig,
  TezosFA2ProtocolOptions,
  TezosETHtzProtocolConfig,
  TezosWrappedProtocolConfig,
  TezosKolibriUSDProtocolConfig
} from './protocols/tezos/fa/TezosFAProtocolOptions'
import { TezosTransactionResult } from './protocols/tezos/types/TezosTransactionResult'
import { TezosTransactionCursor } from './protocols/tezos/types/TezosTransactionCursor'
import { generateId } from './serializer/utils/generateId'
import { ProtocolSymbols, MainProtocolSymbols, SubProtocolSymbols } from './utils/ProtocolSymbols'
import { TezosUtils } from './protocols/tezos/TezosUtils'
import { TezosFA2Protocol } from './protocols/tezos/fa/TezosFA2Protocol'
import { TezosFA1Protocol } from './protocols/tezos/fa/TezosFA1Protocol'
import { TezosFA12Protocol } from './protocols/tezos/fa/TezosFA12Protocol'
import { DeserializedSyncProtocol, EncodedType, SyncProtocolUtils } from './serializer/v1/serializer'
import { ImportAccountAction, ImportAccoutActionContext } from './actions/GetKtAccountsAction'
import { CosmosUnbondingDelegation, CosmosValidator } from './protocols/cosmos/CosmosNodeClient'
import { SubstrateElectionStatus } from './protocols/substrate/helpers/data/staking/SubstrateEraElectionStatus'
import { SubstrateNominationStatus } from './protocols/substrate/helpers/data/staking/SubstrateNominationStatus'
import { SubstrateNominatorDetails, SubstrateStakingDetails } from './protocols/substrate/helpers/data/staking/SubstrateNominatorDetails'
import { SubstrateStakingActionType } from './protocols/substrate/helpers/data/staking/SubstrateStakingActionType'
import { SubstrateValidatorDetails } from './protocols/substrate/helpers/data/staking/SubstrateValidatorDetails'
import { IAirGapSignedTransaction } from './interfaces/IAirGapSignedTransaction'
import { Action } from './actions/Action'
import { SubstrateTransaction } from './protocols/substrate/helpers/data/transaction/SubstrateTransaction'
import { LinkedAction } from './actions/LinkedAction'
import { SimpleAction } from './actions/SimpleAction'
import { RepeatableAction } from './actions/RepeatableAction'
import { TezosWrappedOperation } from './protocols/tezos/types/TezosWrappedOperation'
import { assertNever } from './utils/assert'
import { CosmosTransaction } from './protocols/cosmos/CosmosTransaction'
import { TezosETHtz } from './protocols/tezos/fa/TezosETHtz'
import { TezosWrapped } from './protocols/tezos/fa/TezosWrapped'
import { TezosKolibriUSD } from './protocols/tezos/fa/TezosKolibriUSD'
import { TezosDomains } from './protocols/tezos/domains/TezosDomains'

// tslint:enable:ordered-imports

// Core
export {
  AirGapWallet,
  AirGapMarketWallet,
  IAirGapWallet,
  IAirGapTransaction,
  ICoinProtocol,
  ICoinSubProtocol,
  ICoinDelegateProtocol,
  CryptoClient,
  ProtocolBlockExplorer,
  ProtocolNetwork,
  ProtocolSymbols,
  MainProtocolSymbols,
  SubProtocolSymbols,
  NetworkType,
  FeeDefaults
}

// Aeternity
export {
  AeternityProtocol,
  AeternityCryptoClient,
  AeternityProtocolOptions,
  AeternalBlockExplorer,
  AeternityProtocolNetwork,
  RawAeternityTransaction
}

// Bitcoin
export {
  BitcoinProtocol,
  BitcoinTestnetProtocol,
  BitcoinCryptoClient,
  BitcoinProtocolNetworkExtras,
  BlockcypherBlockExplorer,
  BitcoinProtocolNetwork,
  BitcoinProtocolConfig,
  BitcoinProtocolOptions,
  RawBitcoinTransaction
}

// Cosmos
export {
  CosmosProtocol,
  CosmosCryptoClient,
  MintscanBlockExplorer,
  CosmosProtocolNetwork,
  CosmosProtocolConfig,
  CosmosProtocolOptions,
  CosmosUnbondingDelegation,
  CosmosValidator,
  CosmosDelegationActionType,
  CosmosTransaction
}

// Ethereum
export {
  EthereumProtocol,
  EthereumRopstenProtocol,
  EthereumClassicProtocol,
  GenericERC20,
  EthereumCryptoClient,
  EthereumProtocolNetworkExtras,
  EtherscanBlockExplorer,
  EthereumProtocolNetwork,
  EthereumProtocolConfig,
  EthereumProtocolOptions,
  EthereumERC20ProtocolConfig,
  EthereumERC20ProtocolOptions,
  RawEthereumTransaction
}

// Groestlcoin
export {
  GroestlcoinProtocol,
  GroestlcoinTestnetProtocol,
  GroestlcoinProtocolNetworkExtras,
  CryptoidBlockExplorer,
  GroestlcoinProtocolNetwork,
  GroestlcoinProtocolConfig,
  GroestlcoinProtocolOptions
}

// Substrate
export {
  SubstrateProtocol,
  PolkadotProtocol,
  KusamaProtocol,
  SubstratePayee,
  SubstrateCryptoClient,
  SubstrateProtocolNetworkExtras,
  PolkascanBlockExplorer,
  SubstrateProtocolConfig,
  SubstrateProtocolNetwork,
  SubstrateProtocolOptions,
  KusamaProtocolNetworkExtras,
  KusamaPolkascanBlockExplorer,
  KusamaProtocolConfig,
  KusamaProtocolNetwork,
  KusamaProtocolOptions,
  PolkadotProtocolNetworkExtras,
  PolkadotPolkascanBlockExplorer,
  PolkadotProtocolConfig,
  PolkadotProtocolNetwork,
  PolkadotProtocolOptions,
  SubstrateElectionStatus,
  SubstrateNominationStatus,
  SubstrateNominatorDetails,
  SubstrateStakingDetails,
  SubstrateStakingActionType,
  SubstrateValidatorDetails,
  SubstrateTransaction,
  RawSubstrateTransaction
}

// Tezos
export {
  TezosProtocol,
  TezosKtProtocol,
  TezosFAProtocol,
  TezosFA1Protocol,
  TezosFA12Protocol,
  TezosFA2Protocol,
  TezosBTC,
  TezosStaker,
  TezosUSD,
  TezosETHtz as TezosETH,
  TezosWrapped,
  TezosKolibriUSD,
  TezosTransactionResult,
  TezosTransactionCursor,
  BakerInfo,
  DelegationRewardInfo,
  DelegationInfo,
  TezosPayoutInfo,
  TezosDelegatorAction,
  TezosCryptoClient,
  TezosProtocolNetworkExtras,
  TezblockBlockExplorer,
  TezosProtocolNetwork,
  TezosProtocolConfig,
  TezosProtocolOptions,
  TezosFAProtocolConfig,
  TezosFA2ProtocolConfig,
  TezosBTCProtocolConfig,
  TezosETHtzProtocolConfig as TezosETHProtocolConfig,
  TezosWrappedProtocolConfig,
  TezosKolibriUSDProtocolConfig,
  TezosStakerProtocolConfig,
  TezosUSDProtocolConfig,
  TezosFAProtocolOptions,
  TezosFA2ProtocolOptions,
  TezosNetwork,
  TezosUtils,
  TezosWrappedOperation,
  RawTezosTransaction,
  TezosDomains
}

// Serializer
export {
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
  Serializer,
  DeserializedSyncProtocol,
  EncodedType,
  SyncProtocolUtils,
  Message,
  SerializedAirGapWallet
}

// Action
export { Action, RepeatableAction, LinkedAction, SimpleAction, ImportAccountAction, ImportAccoutActionContext }

// Helper
export {
  isNetworkEqual,
  getProtocolOptionsByIdentifier,
  addSupportedProtocol,
  getProtocolByIdentifier,
  getSubProtocolsByIdentifier,
  supportedProtocols,
  // sub protocols configs,
  TypeNotSupported,
  SerializerVersionMismatch,
  ProtocolNotSupported,
  ProtocolVersionMismatch,
  // libsodium ready
  isCoinlibReady,
  // sub-protocols
  addSubProtocol,
  generateId,
  TimeInterval,
  DelegateeDetails,
  DelegatorAction,
  DelegatorDetails,
  DelegatorReward,
  IAirGapSignedTransaction,
  IAirGapTransactionResult,
  AirGapWalletPriceService,
  IProtocolTransactionCursor,
  SubProtocolType,
  assertNever
}
