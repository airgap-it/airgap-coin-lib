import { Address, AddressCursor, AddressWithCursor } from '../types/address'
import { AirGapInterface, ApplicableProtocolExtension } from '../types/airgap'
import { Amount } from '../types/amount'
import { Balance } from '../types/balance'
import { FeeEstimation } from '../types/fee'
import { KeyPair, PublicKey, SecretKey } from '../types/key'
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
  _AddressCursor extends BaseGeneric['AddressCursor'],
  _AddressResult extends BaseGeneric['AddressResult'],
  _Units extends BaseGeneric['Units'],
  _FeeUnits extends BaseGeneric['FeeUnits'],
  _SignedTransaction extends BaseGeneric['SignedTransaction'],
  _UnsignedTransaction extends BaseGeneric['UnsignedTransaction']
> {
  getMetadata(): Promise<ProtocolMetadata<_Units, _FeeUnits>>

  getAddressFromPublicKey(publicKey: PublicKey): Promise<_AddressResult>

  getDetailsFromTransaction(
    transaction: _UnsignedTransaction | _SignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<_Units, _FeeUnits>[]>
}
export type BaseProtocol<G extends Partial<BaseGeneric> = {}> = _BaseProtocol<
  TypedAddressCursor<G>,
  TypedAddressResult<G>,
  TypedUnits<G>,
  TypedFeeUnits<G>,
  TypedSignedTransaction<G>,
  TypedUnsignedTransaction<G>
>

export interface _OfflineProtocol<
  _AddressCursor extends OfflineGeneric['AddressCursor'],
  _AddressResult extends OfflineGeneric['AddressResult'],
  _Units extends BaseGeneric['Units'],
  _FeeUnits extends BaseGeneric['FeeUnits'],
  _SignedTransaction extends BaseGeneric['SignedTransaction'],
  _UnsignedTransaction extends BaseGeneric['UnsignedTransaction']
> extends _BaseProtocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction> {
  getKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<KeyPair>

  signTransactionWithSecretKey(transaction: _UnsignedTransaction, secretKey: SecretKey): Promise<_SignedTransaction>
}
export type OfflineProtocol<G extends Partial<OfflineGeneric> = {}> = _OfflineProtocol<
  TypedAddressCursor<G>,
  TypedAddressResult<G>,
  TypedUnits<G>,
  TypedFeeUnits<G>,
  TypedSignedTransaction<G>,
  TypedUnsignedTransaction<G>
>

export interface _OnlineProtocol<
  _AddressCursor extends OnlineGeneric['AddressCursor'],
  _AddressResult extends OnlineGeneric['AddressResult'],
  _ProtocolNetwork extends OnlineGeneric['ProtocolNetwork'],
  _Units extends OnlineGeneric['Units'],
  _FeeUnits extends OnlineGeneric['FeeUnits'],
  _FeeEstimation extends OnlineGeneric['FeeEstimation'],
  _SignedTransaction extends OnlineGeneric['SignedTransaction'],
  _UnsignedTransaction extends OnlineGeneric['UnsignedTransaction'],
  _TransactionCursor extends OnlineGeneric['TransactionCursor']
> extends _BaseProtocol<_AddressCursor, _AddressResult, _Units, _FeeUnits, _SignedTransaction, _UnsignedTransaction> {
  getNetwork(): Promise<_ProtocolNetwork>

  getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: _TransactionCursor
  ): Promise<AirGapTransactionsWithCursor<_TransactionCursor, _Units, _FeeUnits>>

  getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<_Units>>

  getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: Address[],
    configuration?: TransactionConfiguration<_FeeUnits>
  ): Promise<Amount<_Units>>
  getTransactionFeeWithPublicKey(publicKey: PublicKey, details: TransactionDetails<_Units>[]): Promise<_FeeEstimation>
  prepareTransactionWithPublicKey(
    publicKey: PublicKey,
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
  TypedTransactionCursor<G>
>

export interface Protocol<G extends Partial<OfflineGeneric & OnlineGeneric> = {}> extends OfflineProtocol<G>, OnlineProtocol<G> {}
export type AnyProtocol<G extends Partial<OfflineGeneric & OnlineGeneric> = {}> = OfflineProtocol<G> | OnlineProtocol<G>

// Convinience Types

export type AirGapOfflineProtocol<
  G extends Partial<OfflineGeneric> = {},
  E0 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E1 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E2 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E3 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E4 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E5 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E6 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E7 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E8 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined,
  E9 extends ApplicableProtocolExtension<OfflineProtocol<any>> = undefined
> = AirGapInterface<OfflineProtocol<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>

export type AirGapOnlineProtocol<
  G extends Partial<OnlineGeneric> = {},
  E0 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E1 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E2 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E3 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E4 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E5 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E6 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E7 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E8 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined,
  E9 extends ApplicableProtocolExtension<OnlineProtocol<any>> = undefined
> = AirGapInterface<OnlineProtocol<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>

export type AirGapProtocol<
  G extends Partial<OfflineGeneric & OnlineGeneric> = {},
  E0 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E1 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E2 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E3 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E4 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E5 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E6 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E7 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E8 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined,
  E9 extends ApplicableProtocolExtension<OfflineProtocol<any> & OnlineProtocol<any>> = undefined
> = AirGapInterface<Protocol<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>

export type AirGapAnyProtocol<
  G extends Partial<OfflineGeneric & OnlineGeneric> = {},
  E0 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E1 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E2 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E3 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E4 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E5 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E6 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E7 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E8 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined,
  E9 extends ApplicableProtocolExtension<OfflineProtocol<any> | OnlineProtocol<any>> = undefined
> = AirGapInterface<AnyProtocol<G>, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9>
