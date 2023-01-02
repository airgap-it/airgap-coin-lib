import { AnyProtocol, OfflineProtocol, OnlineProtocol, Protocol } from '../protocol'
import { FetchDataForAddressExtension } from './address/FetchDataForAddressExtension'

import { FetchDataForMultipleAddressesExtension } from './address/FetchDataForMultipleAddressesExtension'
import { MultiAddressPublicKeyExtension } from './address/MultiAddressPublicKeyExtension'
import { Bip32OverridingExtension } from './bip/Bip32OverridingExtension'
import { ConfigurableContractExtension } from './contract/ConfigurableContractExtension'
import { AESExtension } from './crypto/AESExtension'
import { AsymmetricEncryptionExtension } from './crypto/AsymmetricEncryptionExtension'
import { CryptoExtension } from './crypto/CryptoExtension'
import { SignMessageExtension } from './crypto/SignMessageExtension'
import { ContractSubProtocolExtension } from './sub-protocol/ContractSubProtocolExtension'
import { SubProtocolExtension } from './sub-protocol/SubProtocolExtension'
import { ConfigurableTransactionInjectorExtension } from './transaction/ConfigurableTransactionInjectorExtension'
import { TransactionStatusCheckerExtension } from './transaction/TransactionStatusCheckerExtension'

export type ProtocolExtensions<T> = T extends Protocol<any>
  ? OfflineExtensions<T> & OnlineExtensions<T>
  : T extends OfflineProtocol<any>
  ? OfflineExtensions<T>
  : T extends OnlineProtocol<any>
  ? OnlineExtensions<T>
  : never

interface OfflineAndOnlineExtensions<T extends AnyProtocol> {
  Bip32OverridingExtension: Bip32OverridingExtension<T>

  ConfigurableContractExtension: ConfigurableContractExtension<T>

  MultiAddressPublicKeyExtension: MultiAddressPublicKeyExtension<T>

  SubProtocolExtension: SubProtocolExtension<T>
  ContractSubProtocolExtension: ContractSubProtocolExtension<T>

  CryptoExtension: CryptoExtension<T>
  AsymmetricEncryptionExtension: AsymmetricEncryptionExtension<T>
  SignMessageExtension: SignMessageExtension<T>
}

interface OfflineExtensions<T extends OfflineProtocol> extends OfflineAndOnlineExtensions<T> {
  AESExtension: AESExtension<T>
}

interface OnlineExtensions<T extends OnlineProtocol> extends OfflineAndOnlineExtensions<T> {
  FetchDataForAddressExtension: FetchDataForAddressExtension<T>
  FetchDataForMultipleAddressesExtension: FetchDataForMultipleAddressesExtension<T>

  ConfigurableTransactionInjectorExtension: ConfigurableTransactionInjectorExtension<T>
  TransactionStatusCheckerExtension: TransactionStatusCheckerExtension<T>
}
