import { AnyProtocol, OfflineProtocol, OnlineProtocol, Protocol } from '../protocol'

import { MultiAddressAccountExtension } from './address/MultiAddressAccountExtension'
import { MultiAddressPublicKeyExtension } from './address/MultiAddressPublicKeyExtension'
import { Bip32OverridingExtension } from './bip/Bip32OverridingExtension'
import { ContractProtocolExtension } from './sub-protocol/ContractProtocolExtension'
import { SubProtocolExtension } from './sub-protocol/SubProtocolExtension'
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

  MultiAddressPublicKeyExtension: MultiAddressPublicKeyExtension<T>

  SubProtocolExtension: SubProtocolExtension<T>
  ContractProtocolExtension: ContractProtocolExtension<T>
}

interface OfflineExtensions<T extends OfflineProtocol> extends OfflineAndOnlineExtensions<T> {}

interface OnlineExtensions<T extends OnlineProtocol> extends OfflineAndOnlineExtensions<T> {
  MultiAddressAccountExtension: MultiAddressAccountExtension<T>
  TransactionStatusCheckerExtension: TransactionStatusCheckerExtension<T>
}
