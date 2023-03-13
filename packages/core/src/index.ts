import { Action } from './actions/Action'
import { LinkedAction } from './actions/LinkedAction'
import { RepeatableAction } from './actions/RepeatableAction'
import { SimpleAction } from './actions/SimpleAction'
import {
  BalanceError,
  NetworkError,
  ProtocolErrorType,
  ProtocolNotSupported,
  SerializerErrorType,
  SerializerVersionMismatch,
  TransactionError,
  TypeNotSupported
} from './errors'
import { CoinlibError, Domain } from './errors/coinlib-error'
import { IAirGapSignedTransaction } from './interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction, IAirGapTransactionResult, IProtocolTransactionCursor } from './interfaces/IAirGapTransaction'
import { IAirGapWallet } from './interfaces/IAirGapWallet'
import { CryptoClient } from './protocols/CryptoClient'
import { HasConfigurableContract } from './protocols/HasConfigurableContract'
import {
  DelegateeDetails,
  DelegationDetails,
  DelegatorAction,
  DelegatorDetails,
  DelegatorReward,
  ICoinDelegateProtocol
} from './protocols/ICoinDelegateProtocol'
import { FeeDefaults, ICoinProtocol } from './protocols/ICoinProtocol'
import { ICoinSubProtocol, SubProtocolType } from './protocols/ICoinSubProtocol'
import { SignedTransaction } from './types/signed-transaction'
import { UnsignedTransaction } from './types/unsigned-transaction'
import { assertNever } from './utils/assert'
import { bufferFrom } from './utils/buffer'
import { hasConfigurableContract, implementsInterface } from './utils/interfaces'
import { isNetworkEqual } from './utils/Network'
import { ProtocolBlockExplorer } from './utils/ProtocolBlockExplorer'
import { NetworkType, ProtocolNetwork } from './utils/ProtocolNetwork'
import {
  isMainProtocolSymbol,
  isProtocolSymbol,
  isSubProtocolSymbol,
  MainProtocolSymbols,
  ProtocolSymbols,
  SubProtocolSymbols
} from './utils/ProtocolSymbols'
import { AirGapCoinWallet, TimeInterval } from './wallet/AirGapCoinWallet'
import { AirGapMarketWallet, AirGapWalletPriceService } from './wallet/AirGapMarketWallet'
import { AirGapNFTWallet } from './wallet/AirGapNFTWallet'
import { AirGapWallet, AirGapWalletStatus, SerializedAirGapWallet } from './wallet/AirGapWallet'

// Core
export {
  AirGapWallet,
  AirGapMarketWallet,
  AirGapCoinWallet,
  AirGapWalletStatus,
  AirGapNFTWallet,
  HasConfigurableContract,
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

// Types
export { UnsignedTransaction, SignedTransaction }

// Serializer
export { SerializedAirGapWallet }

// Action
export { Action, RepeatableAction, LinkedAction, SimpleAction }

// Helper
export {
  isNetworkEqual,
  isProtocolSymbol,
  isMainProtocolSymbol,
  isSubProtocolSymbol,
  // sub protocols configs,
  TypeNotSupported,
  SerializerVersionMismatch,
  ProtocolNotSupported,
  NetworkError,
  CoinlibError,
  SerializerErrorType,
  ProtocolErrorType,
  BalanceError,
  TransactionError,
  Domain,
  TimeInterval,
  DelegateeDetails,
  DelegatorAction,
  DelegatorDetails,
  DelegationDetails,
  DelegatorReward,
  IAirGapSignedTransaction,
  IAirGapTransactionResult,
  AirGapWalletPriceService,
  IProtocolTransactionCursor,
  SubProtocolType,
  assertNever,
  implementsInterface,
  hasConfigurableContract
}

export { bufferFrom } // TODO: Helper method for angular component lib
