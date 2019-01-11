import { BitcoinProtocol } from './protocols/BitcoinProtocol'
import { BitcoinTestnetProtocol } from './protocols/BitcoinTestnetProtocol'
import { LitecoinProtocol } from './protocols/LitecoinProtocol'
import { ZCashProtocol } from './protocols/ZCashProtocol'
import { ZCashTestnetProtocol } from './protocols/ZCashTestnetProtocol'
import { EthereumProtocol } from './protocols/EthereumProtocol'
import { EthereumRopstenProtocol } from './protocols/EthereumRopstenProtocol'
import { EthereumClassicProtocol } from './protocols/EthereumClassicProtocol'
import { GenericERC20 } from './protocols/GenericERC20'
import { HOPTokenProtocol } from './protocols/HOPTokenProtocol'
import { AETokenProtocol } from './protocols/AETokenProtocol'
import { AEProtocol } from './protocols/AEProtocol'
import { TezosProtocol } from './protocols/TezosProtocol'
import { AirGapWallet } from './wallet/AirGapWallet'
import { AirGapMarketWallet } from './wallet/AirGapMarketWallet'
import { IAirGapWallet } from './interfaces/IAirGapWallet'
import { IAirGapTransaction } from './interfaces/IAirGapTransaction'
import { ICoinProtocol } from './protocols/ICoinProtocol'
import { SyncProtocolUtils, DeserializedSyncProtocol, EncodedType } from './serializer/serializer'
import { SyncWalletRequest } from './serializer/wallet-sync.serializer'
import { UnsignedTransaction } from './serializer/unsigned-transaction.serializer'
import { SignedTransaction } from './serializer/signed-transaction.serializer'
import { TypeNotSupported, SerializerVersionMismatch, ProtocolNotSupported, ProtocolVersionMismatch } from './serializer/errors'
import * as sodium from 'libsodium-wrappers'

const supportedProtocols = function(): ICoinProtocol[] {
  return [new BitcoinProtocol(), new EthereumProtocol(), new AETokenProtocol(), new AEProtocol(), new TezosProtocol()]
}

const getProtocolByIdentifier = function(identifier: string) {
  for (let coinProtocol of supportedProtocols()) {
    if (coinProtocol.identifier === identifier) {
      return coinProtocol
    }
  }
}

const isCoinlibReady = function() {
  return sodium.ready
}

export {
  getProtocolByIdentifier,
  supportedProtocols,
  AirGapWallet,
  AirGapMarketWallet,
  IAirGapWallet,
  IAirGapTransaction,
  ICoinProtocol,
  BitcoinProtocol,
  BitcoinTestnetProtocol,
  LitecoinProtocol,
  ZCashProtocol,
  ZCashTestnetProtocol,
  EthereumProtocol,
  EthereumRopstenProtocol,
  EthereumClassicProtocol,
  GenericERC20,
  HOPTokenProtocol,
  AETokenProtocol,
  AEProtocol,
  TezosProtocol,
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
  isCoinlibReady
}
