import { Address, AddressCursor, AddressWithCursor } from '../types/address'
import { Amount } from '../types/amount'
import { Balance } from '../types/balance'
import { FeeEstimation } from '../types/fee'
import { ExtendedKeyPair, ExtendedPrivateKey, ExtendedPublicKey, KeyPair, PrivateKey, PublicKey } from '../types/key'
import { Complement } from '../types/meta/utility-types'
import { Secret } from '../types/secret'
import { Signature } from '../types/signature'
import {
  AirGapTransactionsWithCursor,
  SignedTransaction,
  TransactionCursor,
  TransactionDetails,
  UnsignedTransaction
} from '../types/transaction'

import { AirGapOfflineProtocol, AirGapOnlineProtocol, BaseGeneric, BaseProtocol, OfflineGeneric, OnlineGeneric } from './AirGapProtocol'

// ##### Type #####

interface BaseExtendedGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseGeneric<_AddressCursor, _SignedTransaction, _Units, _UnsignedTransaction> {}

interface OfflineExtendedGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseExtendedGeneric<_AddressCursor, _SignedTransaction, _Units, _UnsignedTransaction>,
    OfflineGeneric<_AddressCursor, _SignedTransaction, _Units, _UnsignedTransaction> {}

interface OnlineExtendedGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _TransactionCursor extends TransactionCursor = TransactionCursor,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseExtendedGeneric<_AddressCursor, _SignedTransaction, _Units, _UnsignedTransaction>,
    OnlineGeneric<_AddressCursor, _SignedTransaction, _TransactionCursor, _Units, _UnsignedTransaction> {}

type TypedAddressCursor<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['AddressCursor']
type TypedSignedTransaction<G extends Partial<BaseExtendedGeneric>> = Complement<BaseExtendedGeneric, G>['SignedTransaction']
type TypedTransactionCursor<G extends Partial<OnlineExtendedGeneric>> = Complement<OnlineExtendedGeneric, G>['TransactionCursor']
type TypedUnsignedTransaction<G extends Partial<BaseExtendedGeneric>> = Complement<BaseExtendedGeneric, G>['UnsignedTransaction']
type TypedUnits<G extends Partial<BaseExtendedGeneric>> = Complement<BaseExtendedGeneric, G>['Units']

// ##### Protocol #####

export interface BaseExtendedProtocol<G extends Partial<BaseExtendedGeneric> = {}> extends BaseProtocol<G> {
  deriveFromExtendedPublicKey(publicKey: ExtendedPublicKey, visibilityIndex: number, addressIndex: number): Promise<PublicKey>

  convertKeyFormat<K extends PrivateKey | ExtendedPrivateKey | PublicKey | ExtendedPublicKey, F extends K['format']>(
    key: K,
    targetFormat: F
  ): Promise<(Omit<K, 'format'> & { format: F }) | undefined>

  getNextAddressFromPublicKey(
    publicKey: ExtendedPublicKey,
    cursor: TypedAddressCursor<G>
  ): Promise<AddressWithCursor<TypedAddressCursor<G>> | undefined>

  verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey | ExtendedPublicKey): Promise<boolean>
  encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string>
}

export interface AirGapOfflineExtendedProtocol<G extends Partial<OfflineExtendedGeneric> = {}>
  extends BaseExtendedProtocol<G>,
    Omit<AirGapOfflineProtocol<G>, keyof BaseExtendedProtocol<G>> {
  getExtendedKeyPairFromSecret(secret: Secret, derivationPath?: string, password?: string): Promise<ExtendedKeyPair>

  signTransactionWithPrivateKey(
    transaction: TypedUnsignedTransaction<G>,
    privateKey: PrivateKey | ExtendedPrivateKey
  ): Promise<TypedSignedTransaction<G>>

  signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature>

  decryptAsymmetricWithPrivateKey(payload: string, privateKey: PrivateKey | ExtendedPrivateKey): Promise<string>

  encryptAESWithPrivateKey(payload: string, privateKey: PrivateKey | ExtendedPrivateKey): Promise<string>

  decryptAESWithPrivateKey(payload: string, privateKey: PrivateKey | ExtendedPrivateKey): Promise<string>
}

export interface AirGapOnlineExtendedProtocol<G extends Partial<OnlineExtendedGeneric> = {}>
  extends BaseExtendedProtocol<G>,
    Omit<AirGapOnlineProtocol<G>, keyof BaseExtendedProtocol<G>> {
  getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: TypedTransactionCursor<G>
  ): Promise<AirGapTransactionsWithCursor<TypedUnits<G>, TypedTransactionCursor<G>>>

  getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<TypedUnits<G>>>

  getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: Address[],
    fee?: Amount<TypedUnits<G>>
  ): Promise<Amount<TypedUnits<G>>> // how should it be calulated? value distributed amongst addresses passed in in `to` or should we limit it to only one recipient?
  getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails[]
  ): Promise<FeeEstimation<TypedUnits<G>>>
  prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails[],
    fee?: Amount<TypedUnits<G>>
  ): Promise<TypedUnsignedTransaction<G>>
}

export interface AirGapExtendedProtocol<G extends Partial<OfflineExtendedGeneric & OnlineExtendedGeneric> = {}>
  extends AirGapOfflineExtendedProtocol<G>,
    AirGapOnlineExtendedProtocol<G> {}

export type AirGapAnyExtendedProtocol<G extends Partial<OfflineExtendedGeneric & OnlineExtendedGeneric> = {}> =
  | AirGapOfflineExtendedProtocol<G>
  | AirGapOnlineExtendedProtocol<G>
