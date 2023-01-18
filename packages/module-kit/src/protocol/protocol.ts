import { Address, AddressCursor, AddressWithCursor } from '../types/address'
import { AirGapInterface, ApplicableProtocolExtension } from '../types/airgap'
import { Amount } from '../types/amount'
import { Balance } from '../types/balance'
import { FeeEstimation } from '../types/fee'
import { ExtendedKeyPair, ExtendedPublicKey, ExtendedSecretKey, KeyPair, PublicKey, SecretKey } from '../types/key'
import { Complement } from '../types/meta/utility-types'
import { ProtocolMetadata, ProtocolNetwork } from '../types/protocol'
import { Secret } from '../types/secret'
import {
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  SignedTransaction,
  TransactionConfiguration,
  TransactionCursor,
  TransactionDetails,
  UnsignedTransaction
} from '../types/transaction'

// ##### Type #####

export interface BaseGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _AddressResult extends Address | AddressWithCursor<_AddressCursor> = Address | AddressWithCursor<_AddressCursor>,
  _Units extends string = string,
  _FeeUnits extends string = _Units,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> {
  AddressCursor: _AddressCursor
  AddressResult: _AddressResult
  Units: _Units
  FeeUnits: _FeeUnits
  SignedTransaction: _SignedTransaction
  UnsignedTransaction: _UnsignedTransaction
}

export interface OfflineGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _AddressResult extends Address | AddressWithCursor<_AddressCursor> = Address | AddressWithCursor<_AddressCursor>,
  _Units extends string = string,
  _FeeUnits extends string = _Units,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseGeneric<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction> {}

export interface OnlineGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _AddressResult extends Address | AddressWithCursor<_AddressCursor> = Address | AddressWithCursor<_AddressCursor>,
  _ProtocolNetwork extends ProtocolNetwork = ProtocolNetwork,
  _Units extends string = string,
  _FeeUnits extends string = _Units,
  _FeeEstimation extends FeeEstimation<_FeeUnits> | undefined = FeeEstimation<_FeeUnits> | undefined,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction,
  _TransactionCursor extends TransactionCursor = TransactionCursor
> extends BaseGeneric<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction> {
  ProtocolNetwork: _ProtocolNetwork
  FeeEstimation: _FeeEstimation
  TransactionCursor: _TransactionCursor
}

type TypedAddressCursor<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['AddressCursor']
type TypedAddressResult<G extends Partial<BaseGeneric>> = Complement<BaseGeneric<TypedAddressCursor<G>>, G>['AddressResult']

type TypedProtocolNetwork<G extends Partial<OnlineGeneric>> = Complement<OnlineGeneric, G>['ProtocolNetwork']

type TypedUnits<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['Units']
type TypedFeeUnits<G extends Partial<BaseGeneric>> = Complement<BaseGeneric<any, any, TypedUnits<G>>, G>['FeeUnits']

type TypedFeeEstimation<G extends Partial<OnlineGeneric>> = Complement<
  OnlineGeneric<any, any, any, any, TypedFeeUnits<G>>,
  G
>['FeeEstimation']

type TypedSignedTransaction<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['SignedTransaction']
type TypedUnsignedTransaction<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['UnsignedTransaction']
type TypedTransactionCursor<G extends Partial<OnlineGeneric>> = Complement<OnlineGeneric, G>['TransactionCursor']

// ##### Protocol #####

export interface _BaseProtocol<
  _AddressCursor extends BaseGeneric['AddressCursor'] = any,
  _AddressResult extends BaseGeneric['AddressResult'] = any,
  _Units extends BaseGeneric['Units'] = any,
  _FeeUnits extends BaseGeneric['FeeUnits'] = any,
  _SignedTransaction extends BaseGeneric['SignedTransaction'] = any,
  _UnsignedTransaction extends BaseGeneric['UnsignedTransaction'] = any,
  _PublicKey extends PublicKey | ExtendedPublicKey = any
> {
  getMetadata(): Promise<ProtocolMetadata<_Units, _FeeUnits>>

  getAddressFromPublicKey(publicKey: _PublicKey): Promise<_AddressResult>

  getDetailsFromTransaction(
    transaction: _UnsignedTransaction | _SignedTransaction,
    publicKey: _PublicKey
  ): Promise<AirGapTransaction<_Units, _FeeUnits>[]>
}
export type BaseProtocol<G extends Partial<BaseGeneric> = {}> = _BaseProtocol<
  TypedAddressCursor<G>,
  TypedAddressResult<G>,
  TypedUnits<G>,
  TypedFeeUnits<G>,
  TypedSignedTransaction<G>,
  TypedUnsignedTransaction<G>,
  PublicKey
>

export interface _OfflineProtocol<
  _AddressCursor extends OfflineGeneric['AddressCursor'] = any,
  _AddressResult extends OfflineGeneric['AddressResult'] = any,
  _Units extends BaseGeneric['Units'] = any,
  _FeeUnits extends BaseGeneric['FeeUnits'] = any,
  _SignedTransaction extends BaseGeneric['SignedTransaction'] = any,
  _UnsignedTransaction extends BaseGeneric['UnsignedTransaction'] = any,
  _PublicKey extends PublicKey | ExtendedPublicKey = any,
  _SecretKey extends SecretKey | ExtendedSecretKey = any,
  _KeyPair extends KeyPair | ExtendedKeyPair = any
> extends _BaseProtocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction, _PublicKey> {
  getKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<KeyPair>

  signTransactionWithSecretKey(transaction: _UnsignedTransaction, secretKey: _SecretKey): Promise<_SignedTransaction>
}
export type OfflineProtocol<G extends Partial<OfflineGeneric> = {}> = _OfflineProtocol<
  TypedAddressCursor<G>,
  TypedAddressResult<G>,
  TypedUnits<G>,
  TypedFeeUnits<G>,
  TypedSignedTransaction<G>,
  TypedUnsignedTransaction<G>,
  PublicKey,
  SecretKey,
  KeyPair
>

export interface _OnlineProtocol<
  _AddressCursor extends OnlineGeneric['AddressCursor'] = any,
  _AddressResult extends OnlineGeneric['AddressResult'] = any,
  _ProtocolNetwork extends OnlineGeneric['ProtocolNetwork'] = any,
  _Units extends OnlineGeneric['Units'] = any,
  _FeeUnits extends OnlineGeneric['FeeUnits'] = any,
  _FeeEstimation extends OnlineGeneric['FeeEstimation'] = any,
  _SignedTransaction extends OnlineGeneric['SignedTransaction'] = any,
  _UnsignedTransaction extends OnlineGeneric['UnsignedTransaction'] = any,
  _TransactionCursor extends OnlineGeneric['TransactionCursor'] = any,
  _PublicKey extends PublicKey | ExtendedPublicKey = any,
  _BalanceConfiguration extends Object | undefined = any
> extends _BaseProtocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction, _PublicKey> {
  getNetwork(): Promise<_ProtocolNetwork>

  getTransactionsForPublicKey(
    publicKey: _PublicKey,
    limit: number,
    cursor?: _TransactionCursor
  ): Promise<AirGapTransactionsWithCursor<_TransactionCursor, _Units, _FeeUnits>>

  // TODO: check if there's a better way to do multi token extension
  getBalanceOfPublicKey(publicKey: _PublicKey, configuration?: _BalanceConfiguration): Promise<Balance<_Units>>

  getTransactionMaxAmountWithPublicKey(
    publicKey: _PublicKey,
    to: Address[],
    configuration?: TransactionConfiguration<_FeeUnits>
  ): Promise<Amount<_Units>>
  getTransactionFeeWithPublicKey(publicKey: _PublicKey, details: TransactionDetails<_Units>[]): Promise<_FeeEstimation>
  prepareTransactionWithPublicKey(
    publicKey: _PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionConfiguration<_FeeUnits>
  ): Promise<_UnsignedTransaction>

  broadcastTransaction(transaction: _SignedTransaction): Promise<string>
}

export type OnlineProtocol<G extends Partial<OnlineGeneric> = {}> = _OnlineProtocol<
  TypedAddressCursor<G>,
  TypedAddressResult<G>,
  TypedProtocolNetwork<G>,
  TypedUnits<G>,
  TypedFeeUnits<G>,
  TypedFeeEstimation<G>,
  TypedSignedTransaction<G>,
  TypedUnsignedTransaction<G>,
  TypedTransactionCursor<G>,
  PublicKey,
  undefined
>

export type _Protocol = _OfflineProtocol & _OnlineProtocol
export interface Protocol<G extends Partial<OfflineGeneric & OnlineGeneric> = {}> extends OfflineProtocol<G>, OnlineProtocol<G> {}

export type _AnyProtocol = _OfflineProtocol | _OnlineProtocol
export type AnyProtocol<G extends Partial<OfflineGeneric & OnlineGeneric> = {}> = OfflineProtocol<G> | OnlineProtocol<G>

// Convinience Types

export type AirGapOfflineProtocol<
  G extends Partial<OfflineGeneric> = {},
  E0 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E1 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E2 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E3 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E4 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E5 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E6 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E7 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E8 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined,
  E9 extends ApplicableProtocolExtension<_OfflineProtocol> = undefined
> = AirGapInterface<OfflineProtocol<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>

export type AirGapOnlineProtocol<
  G extends Partial<OnlineGeneric> = {},
  E0 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E1 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E2 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E3 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E4 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E5 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E6 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E7 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E8 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined,
  E9 extends ApplicableProtocolExtension<_OnlineProtocol> = undefined
> = AirGapInterface<OnlineProtocol<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>

export type AirGapProtocol<
  G extends Partial<OfflineGeneric & OnlineGeneric> = {},
  E0 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E1 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E2 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E3 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E4 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E5 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E6 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E7 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E8 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined,
  E9 extends ApplicableProtocolExtension<_OfflineProtocol & _OnlineProtocol> = undefined
> = AirGapInterface<Protocol<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>

export type AirGapAnyProtocol<
  G extends Partial<OfflineGeneric & OnlineGeneric> = {},
  E0 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E1 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E2 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E3 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E4 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E5 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E6 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E7 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E8 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined,
  E9 extends ApplicableProtocolExtension<_OfflineProtocol | _OnlineProtocol> = undefined
> = AirGapInterface<AnyProtocol<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>
