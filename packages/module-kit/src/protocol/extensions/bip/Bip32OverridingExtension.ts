import { Address } from '../../../types/address'
import { Amount } from '../../../types/amount'
import { Balance } from '../../../types/balance'
import { ExtendedKeyPair, ExtendedPublicKey, ExtendedSecretKey, PublicKey, SecretKey } from '../../../types/key'
import { Override } from '../../../types/meta/utility-types'
import { Secret } from '../../../types/secret'
import { AirGapTransaction, AirGapTransactionsWithCursor, TransactionConfiguration, TransactionDetails } from '../../../types/transaction'
import {
  _OfflineProtocol,
  _OnlineProtocol,
  AnyProtocol,
  BaseGeneric,
  OfflineGeneric,
  OfflineProtocol,
  OnlineGeneric,
  OnlineProtocol,
  Protocol
} from '../../protocol'

export type Bip32OverridingExtension<T extends AnyProtocol> = T extends Protocol<any>
  ? Override<T, InferredOfflineBip32Protocol<T> & InferredOnlineBip32Protocol<T>>
  : T extends OfflineProtocol<any>
  ? Override<T, InferredOfflineBip32Protocol<T>>
  : T extends OnlineProtocol<any>
  ? Override<T, InferredOnlineBip32Protocol<T>>
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
  infer _TransactionCursor
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
      _TransactionCursor
    >
  : never

export interface BaseBip32Protocol<
  _AddressCursor extends BaseGeneric['AddressCursor'] = BaseGeneric['AddressCursor'],
  _AddressResult extends BaseGeneric['AddressResult'] = BaseGeneric['AddressResult'],
  _Units extends BaseGeneric['Units'] = BaseGeneric['Units'],
  _FeeUnits extends BaseGeneric['FeeUnits'] = BaseGeneric['FeeUnits'],
  _SignedTransaction extends BaseGeneric['SignedTransaction'] = BaseGeneric['SignedTransaction'],
  _UnsignedTransaction extends BaseGeneric['UnsignedTransaction'] = BaseGeneric['UnsignedTransaction']
> {
  getAddressFromPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<_AddressResult>

  deriveFromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey, visibilityIndex: number, addressIndex: number): Promise<PublicKey>

  getDetailsFromTransaction(
    transaction: _UnsignedTransaction | _SignedTransaction,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<_Units, _FeeUnits>[]>
}

export interface OfflineBip32Protocol<
  _AddressCursor extends OfflineGeneric['AddressCursor'] = OfflineGeneric['AddressCursor'],
  _AddressResult extends OfflineGeneric['AddressResult'] = OfflineGeneric['AddressResult'],
  _Units extends OfflineGeneric['Units'] = OfflineGeneric['Units'],
  _FeeUnits extends OfflineGeneric['FeeUnits'] = OfflineGeneric['FeeUnits'],
  _SignedTransaction extends OfflineGeneric['SignedTransaction'] = OfflineGeneric['SignedTransaction'],
  _UnsignedTransaction extends OfflineGeneric['UnsignedTransaction'] = OfflineGeneric['UnsignedTransaction']
> extends BaseBip32Protocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction> {
  getExtendedKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<ExtendedKeyPair>

  signTransactionWithSecretKey(transaction: _UnsignedTransaction, secretKey: SecretKey | ExtendedSecretKey): Promise<_SignedTransaction>
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
  _TransactionCursor extends OnlineGeneric['TransactionCursor'] = OnlineGeneric['TransactionCursor']
> extends BaseBip32Protocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction> {
  getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: _TransactionCursor
  ): Promise<AirGapTransactionsWithCursor<_TransactionCursor, _Units, _FeeUnits>>

  getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<_Units>>

  getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: Address[],
    configuration?: TransactionConfiguration<_Units>
  ): Promise<Amount<_Units>> // how should it be calulated? value distributed amongst addresses passed in in `to` or should we limit it to only one recipient?
  getTransactionFeeWithPublicKey(publicKey: PublicKey | ExtendedPublicKey, details: TransactionDetails<_Units>[]): Promise<_FeeEstimation>
  prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionConfiguration<_FeeUnits>
  ): Promise<_UnsignedTransaction>
}
