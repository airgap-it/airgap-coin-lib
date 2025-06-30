import { _AnyProtocol, _OfflineProtocol, _OnlineProtocol, _Protocol } from '../protocol'

import { FetchDataForAddressExtension } from './address/FetchDataForAddressExtension'
import { FetchDataForMultipleAddressesExtension } from './address/FetchDataForMultipleAddressesExtension'
import { MultiAddressPublicKeyExtension } from './address/MultiAddressPublicKeyExtension'
import { Bip32Extension } from './bip/Bip32Extension'
import { ConfigurableContractExtension } from './contract/ConfigurableContractExtension'
import { AESExtension } from './crypto/AESExtension'
import { AsymmetricEncryptionExtension } from './crypto/AsymmetricEncryptionExtension'
import { CryptoExtension } from './crypto/CryptoExtension'
import { SignMessageExtension } from './crypto/SignMessageExtension'
import { WalletConnectExtension } from './dapp/WalletConnectProtocol'
import { MultisigExtension } from './multisig/multisig'
import { GetTokenBalancesExtension } from './sub-protocol/GetTokenBalancesExtension'
import { MultiTokenSubProtocolExtension } from './sub-protocol/MultiTokenSubProtocolExtension'
import { SingleTokenSubProtocolExtension } from './sub-protocol/SingleTokenSubProtocolExtension'
import { SubProtocolExtension } from './sub-protocol/SubProtocolExtension'
import { ConfigurableTransactionInjectorExtension } from './transaction/ConfigurableTransactionInjectorExtension'
import { TransactionStatusCheckerExtension } from './transaction/TransactionStatusCheckerExtension'

export type ProtocolExtensions<T> = T extends _Protocol
  ? OfflineExtensions<T> & OnlineExtensions<T>
  : T extends _OfflineProtocol
    ? OfflineExtensions<T>
    : T extends _OnlineProtocol
      ? OnlineExtensions<T>
      : never

interface OfflineAndOnlineExtensions<T extends _AnyProtocol> {
  Bip32: Bip32Extension<T>

  ConfigurableContract: ConfigurableContractExtension<T>

  MultiAddressPublicKey: MultiAddressPublicKeyExtension<T>

  SubProtocol: SubProtocolExtension<T>
  SingleTokenSubProtocol: SingleTokenSubProtocolExtension<T>
  MultiTokenSubProtocol: MultiTokenSubProtocolExtension<T>

  Crypto: CryptoExtension<T>
  AsymmetricEncryption: AsymmetricEncryptionExtension<T>
  SignMessage: SignMessageExtension<T>
}

interface OfflineExtensions<T extends _OfflineProtocol> extends OfflineAndOnlineExtensions<T> {
  AES: AESExtension<T>
}

interface OnlineExtensions<T extends _OnlineProtocol> extends OfflineAndOnlineExtensions<T> {
  FetchDataForAddress: FetchDataForAddressExtension<T>
  FetchDataForMultipleAddresses: FetchDataForMultipleAddressesExtension<T>

  GetTokenBalances: GetTokenBalancesExtension<T>

  ConfigurableTransactionInjector: ConfigurableTransactionInjectorExtension<T>
  TransactionStatusChecker: TransactionStatusCheckerExtension<T>

  WalletConnect: WalletConnectExtension<T>

  Multisig: MultisigExtension<T>
}
