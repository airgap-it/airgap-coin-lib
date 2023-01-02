import { ExtendedKeyPair, ExtendedPublicKey, ExtendedSecretKey, KeyPair, PublicKey, SecretKey } from '../../../types/key'
import { Secret } from '../../../types/secret'
import {
  _AnyProtocol,
  _BaseProtocol,
  _OfflineProtocol,
  _OnlineProtocol,
  _Protocol,
  BaseGeneric,
  OfflineGeneric,
  OnlineGeneric
} from '../../protocol'

export type Bip32Extension<T extends _AnyProtocol> = T extends _Protocol
  ? InferredOfflineBip32Protocol<T> & InferredOnlineBip32Protocol<T>
  : T extends _OfflineProtocol
  ? InferredOfflineBip32Protocol<T>
  : T extends _OnlineProtocol
  ? InferredOnlineBip32Protocol<T>
  : never

type InferredOfflineBip32Protocol<T> = T extends _OfflineProtocol<
  infer _AddressCursor,
  infer _AddressResult,
  infer _Units,
  infer _FeeUnits,
  infer _SignedTransaction,
  infer _UnsignedTransaction
>
  ? OfflineBip32Protocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction>
  : never

type InferredOnlineBip32Protocol<T> = T extends _OnlineProtocol<
  infer _AddressCursor,
  infer _AddressResult,
  infer _ProtocolNetwork,
  infer _Units,
  infer _FeeUnits,
  infer _FeeEstimation,
  infer _SignedTransaction,
  infer _UnsignedTransaction,
  infer _TransactionCursor,
  any,
  infer _BalanceConfiguration
>
  ? OnlineBip32Protocol<
      _AddressCursor,
      _AddressResult,
      _ProtocolNetwork,
      _Units,
      _FeeUnits,
      _FeeEstimation,
      _SignedTransaction,
      _UnsignedTransaction,
      _TransactionCursor,
      _BalanceConfiguration
    >
  : never

export interface BaseBip32Protocol<
  _AddressCursor extends BaseGeneric['AddressCursor'] = BaseGeneric['AddressCursor'],
  _AddressResult extends BaseGeneric['AddressResult'] = BaseGeneric['AddressResult'],
  _Units extends BaseGeneric['Units'] = BaseGeneric['Units'],
  _FeeUnits extends BaseGeneric['FeeUnits'] = BaseGeneric['FeeUnits'],
  _SignedTransaction extends BaseGeneric['SignedTransaction'] = BaseGeneric['SignedTransaction'],
  _UnsignedTransaction extends BaseGeneric['UnsignedTransaction'] = BaseGeneric['UnsignedTransaction']
> extends _BaseProtocol<
    _AddressCursor,
    _AddressResult,
    _Units,
    _FeeUnits,
    _SignedTransaction,
    _UnsignedTransaction,
    PublicKey | ExtendedPublicKey
  > {
  deriveFromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey, visibilityIndex: number, addressIndex: number): Promise<PublicKey>
}

export interface OfflineBip32Protocol<
  _AddressCursor extends OfflineGeneric['AddressCursor'] = OfflineGeneric['AddressCursor'],
  _AddressResult extends OfflineGeneric['AddressResult'] = OfflineGeneric['AddressResult'],
  _Units extends OfflineGeneric['Units'] = OfflineGeneric['Units'],
  _FeeUnits extends OfflineGeneric['FeeUnits'] = OfflineGeneric['FeeUnits'],
  _SignedTransaction extends OfflineGeneric['SignedTransaction'] = OfflineGeneric['SignedTransaction'],
  _UnsignedTransaction extends OfflineGeneric['UnsignedTransaction'] = OfflineGeneric['UnsignedTransaction']
> extends BaseBip32Protocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction>,
    _OfflineProtocol<
      _AddressCursor,
      _AddressResult,
      _Units,
      _FeeUnits,
      _SignedTransaction,
      _UnsignedTransaction,
      PublicKey | ExtendedPublicKey,
      SecretKey | ExtendedSecretKey,
      KeyPair | ExtendedKeyPair
    > {
  getExtendedKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<ExtendedKeyPair>
}

export interface OnlineBip32Protocol<
  _AddressCursor extends OnlineGeneric['AddressCursor'] = OnlineGeneric['AddressCursor'],
  _AddressResult extends OnlineGeneric['AddressResult'] = OnlineGeneric['AddressResult'],
  _ProtocolNetwork extends OnlineGeneric['ProtocolNetwork'] = OnlineGeneric['ProtocolNetwork'],
  _Units extends OnlineGeneric['Units'] = OnlineGeneric['Units'],
  _FeeUnits extends OnlineGeneric['FeeUnits'] = OnlineGeneric['FeeUnits'],
  _FeeEstimation extends OnlineGeneric['FeeEstimation'] = OnlineGeneric['FeeEstimation'],
  _SignedTransaction extends OnlineGeneric['SignedTransaction'] = OnlineGeneric['SignedTransaction'],
  _UnsignedTransaction extends OnlineGeneric['UnsignedTransaction'] = OnlineGeneric['UnsignedTransaction'],
  _TransactionCursor extends OnlineGeneric['TransactionCursor'] = OnlineGeneric['TransactionCursor'],
  _BalanceConfiguration extends Object | undefined = undefined
> extends BaseBip32Protocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction>,
    _OnlineProtocol<
      _AddressCursor,
      _AddressResult,
      _ProtocolNetwork,
      _Units,
      _FeeUnits,
      _FeeEstimation,
      _SignedTransaction,
      _UnsignedTransaction,
      _TransactionCursor,
      PublicKey | ExtendedPublicKey,
      _BalanceConfiguration
    > {}
