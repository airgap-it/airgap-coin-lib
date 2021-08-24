// tslint:disable:ordered-imports
// This needs to be imported first, otherwise the tests won't run anymore
import { EthereumProtocol } from './protocols/ethereum/EthereumProtocol'

import { ProtocolNotSupported, ProtocolVersionMismatch, SerializerVersionMismatch, TypeNotSupported, NetworkError } from './errors'
import { Domain } from './errors/coinlib-error'
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
import { SubstrateAddress } from './protocols/substrate/common/data/account/SubstrateAddress'
import { SubstratePayee } from './protocols/substrate/common/data/staking/SubstratePayee'
import { SubstrateNodeClient } from './protocols/substrate/common/node/SubstrateNodeClient'
import { SubstrateNetwork } from './protocols/substrate/SubstrateNetwork'
import { KusamaProtocol } from './protocols/substrate/kusama/KusamaProtocol'
import { PolkadotProtocol } from './protocols/substrate/polkadot/PolkadotProtocol'
import { SubstrateProtocol } from './protocols/substrate/SubstrateProtocol'
import { SubstrateDelegateProtocol } from './protocols/substrate/SubstrateDelegateProtocol'
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
import { AccountShareResponse as AccountShareResponseV2 } from './serializer/schemas/definitions/account-share-response'
import { AccountShareResponse } from './serializer-v3/schemas/definitions/account-share-response'
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
import { Serializer } from './serializer/serializer'
import { SerializerV3 } from './serializer-v3/serializer'
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
import { AirGapWallet, AirGapWalletStatus, SerializedAirGapWallet } from './wallet/AirGapWallet'
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
} from './protocols/substrate/kusama/KusamaProtocolOptions'
import {
  PolkadotProtocolNetworkExtras,
  PolkadotPolkascanBlockExplorer,
  PolkadotProtocolConfig,
  PolkadotProtocolNetwork,
  PolkadotProtocolOptions
} from './protocols/substrate/polkadot/PolkadotProtocolOptions'
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
  TezosUUSDProtocolConfig,
  TezosYOUProtocolConfig,
  TezosWrappedProtocolConfig,
  TezosKolibriUSDProtocolConfig
} from './protocols/tezos/fa/TezosFAProtocolOptions'
import { TezosTransactionResult } from './protocols/tezos/types/TezosTransactionResult'
import { TezosTransactionCursor } from './protocols/tezos/types/TezosTransactionCursor'
import { generateId } from './serializer-v3/utils/generateId'
import { generateIdV2 } from './serializer/utils/generateId'
import {
  ProtocolSymbols,
  MainProtocolSymbols,
  SubProtocolSymbols,
  isProtocolSymbol,
  isMainProtocolSymbol,
  isSubProtocolSymbol
} from './utils/ProtocolSymbols'
import { TezosUtils } from './protocols/tezos/TezosUtils'
import { TezosFA2Protocol } from './protocols/tezos/fa/TezosFA2Protocol'
import { TezosFA1Protocol } from './protocols/tezos/fa/TezosFA1Protocol'
import { TezosFA12Protocol } from './protocols/tezos/fa/TezosFA12Protocol'
import { TezosSaplingProtocol } from './protocols/tezos/sapling/TezosSaplingProtocol'
import { TezosShieldedTezProtocol } from './protocols/tezos/sapling/TezosShieldedTezProtocol'
import { ImportAccountAction, ImportAccoutActionContext } from './actions/GetKtAccountsAction'
import { CosmosUnbondingDelegation, CosmosValidator } from './protocols/cosmos/CosmosNodeClient'
import { SubstrateElectionStatus } from './protocols/substrate/common/data/staking/SubstrateEraElectionStatus'
import { SubstrateNominationStatus } from './protocols/substrate/common/data/staking/SubstrateNominationStatus'
import { SubstrateNominatorDetails, SubstrateStakingDetails } from './protocols/substrate/common/data/staking/SubstrateNominatorDetails'
import { SubstrateStakingActionType } from './protocols/substrate/common/data/staking/SubstrateStakingActionType'
import { SubstrateValidatorDetails } from './protocols/substrate/common/data/staking/SubstrateValidatorDetails'
import { IAirGapSignedTransaction } from './interfaces/IAirGapSignedTransaction'
import { Action } from './actions/Action'
import { SubstrateTransaction } from './protocols/substrate/common/data/transaction/SubstrateTransaction'
import { LinkedAction } from './actions/LinkedAction'
import { SimpleAction } from './actions/SimpleAction'
import { RepeatableAction } from './actions/RepeatableAction'
import { TezosWrappedOperation } from './protocols/tezos/types/TezosWrappedOperation'
import { assertNever } from './utils/assert'
import { CosmosTransaction } from './protocols/cosmos/CosmosTransaction'
import { CosmosAddress } from './protocols/cosmos/CosmosAddress'

import { TezosETHtz } from './protocols/tezos/fa/TezosETHtz'
import { TezosUUSD } from './protocols/tezos/fa/TezosUUSD'
import { TezosYOU } from './protocols/tezos/fa/TezosYOU'
import { TezosWrapped } from './protocols/tezos/fa/TezosWrapped'
import { TezosKolibriUSD } from './protocols/tezos/fa/TezosKolibriUSD'
import {
  TezosSaplingExternalMethodProvider,
  TezosSaplingProtocolConfig,
  TezosSaplingProtocolOptions,
  TezosShieldedTezProtocolConfig
} from './protocols/tezos/sapling/TezosSaplingProtocolOptions'
import { TezosSaplingTransaction } from './protocols/tezos/types/sapling/TezosSaplingTransaction'
import { TezosDomains } from './protocols/tezos/domains/TezosDomains'
import { AeternityAddress } from './protocols/aeternity/AeternityAddress'
import { BitcoinAddress } from './protocols/bitcoin/BitcoinAddress'
import { EthereumAddress } from './protocols/ethereum/EthereumAddress'
import { TezosAddress } from './protocols/tezos/TezosAddress'
import { IACMessageDefinitionObjectV3 } from './serializer-v3/message'
import { IACMessages as IACMessagesV2 } from './serializer/message'
import { IACMessages } from './serializer-v3/message'
import { MoonbaseProtocol } from './protocols/substrate/moonbeam/moonbase/MoonbaseProtocol'
import { MoonriverProtocol } from './protocols/substrate/moonbeam/moonriver/MoonriverProtocol'
import {
  MoonbaseProtocolConfig,
  MoonbaseProtocolNetwork,
  MoonbaseProtocolNetworkExtras,
  MoonbaseProtocolOptions,
  MoonbaseSubscanBlockExplorer
} from './protocols/substrate/moonbeam/moonbase/MoonbaseProtocolOptions'
import {
  MoonriverProtocolConfig,
  MoonriverProtocolNetwork,
  MoonriverProtocolNetworkExtras,
  MoonriverProtocolOptions,
  MoonriverSubscanBlockExplorer
} from './protocols/substrate/moonbeam/moonriver/MoonriverProtocolOptions'
import { MoonbeamProtocol } from './protocols/substrate/moonbeam/MoonbeamProtocol'

// tslint:enable:ordered-imports

// Core
export {
  AirGapWallet,
  AirGapMarketWallet,
  AirGapWalletStatus,
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
  AeternityAddress,
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
  BitcoinAddress,
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
  CosmosAddress,
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
  EthereumAddress,
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
  SubstrateDelegateProtocol,
  PolkadotProtocol,
  KusamaProtocol,
  MoonbeamProtocol,
  MoonbaseProtocol,
  MoonriverProtocol,
  SubstrateNetwork,
  SubstratePayee,
  SubstrateCryptoClient,
  SubstrateProtocolNetworkExtras,
  PolkascanBlockExplorer,
  SubstrateProtocolConfig,
  SubstrateProtocolNetwork,
  SubstrateProtocolOptions,
  SubstrateNodeClient,
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
  MoonbaseProtocolNetworkExtras,
  MoonbaseSubscanBlockExplorer,
  MoonbaseProtocolConfig,
  MoonbaseProtocolNetwork,
  MoonbaseProtocolOptions,
  MoonriverProtocolNetworkExtras,
  MoonriverSubscanBlockExplorer,
  MoonriverProtocolConfig,
  MoonriverProtocolNetwork,
  MoonriverProtocolOptions,
  SubstrateElectionStatus,
  SubstrateNominationStatus,
  SubstrateNominatorDetails,
  SubstrateStakingDetails,
  SubstrateStakingActionType,
  SubstrateValidatorDetails,
  SubstrateTransaction,
  SubstrateAddress,
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
  TezosUUSD,
  TezosYOU,
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
  TezosUUSDProtocolConfig,
  TezosYOUProtocolConfig,
  TezosWrappedProtocolConfig,
  TezosKolibriUSDProtocolConfig,
  TezosStakerProtocolConfig,
  TezosUSDProtocolConfig,
  TezosFAProtocolOptions,
  TezosFA2ProtocolOptions,
  TezosNetwork,
  TezosSaplingProtocol,
  TezosShieldedTezProtocol,
  TezosSaplingProtocolOptions,
  TezosSaplingProtocolConfig,
  TezosShieldedTezProtocolConfig,
  TezosSaplingExternalMethodProvider,
  TezosSaplingTransaction,
  TezosUtils,
  TezosWrappedOperation,
  TezosAddress,
  RawTezosTransaction,
  TezosDomains
}

// Serializer
export {
  IACMessageType,
  IACMessageDefinitionObject,
  IACMessageDefinitionObjectV3,
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
  Serializer,
  SerializerV3,
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
  isProtocolSymbol,
  isMainProtocolSymbol,
  isSubProtocolSymbol,
  // sub protocols configs,
  TypeNotSupported,
  SerializerVersionMismatch,
  ProtocolNotSupported,
  NetworkError,
  Domain,
  ProtocolVersionMismatch,
  // libsodium ready
  isCoinlibReady,
  // sub-protocols
  addSubProtocol,
  generateId,
  generateIdV2,
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

// TODO: Those can be removed when serializer v2 is removed
export { IACMessages, IACMessagesV2, AccountShareResponseV2 }
