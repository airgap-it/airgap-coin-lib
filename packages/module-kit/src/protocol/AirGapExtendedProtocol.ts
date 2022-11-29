import { Address, AddressCursor, AddressWithCursor } from '../types/address'
import { Amount } from '../types/amount'
import { Balance } from '../types/balance'
import { BytesStringFormat } from '../types/bytes'
import { FeeEstimation } from '../types/fee'
import { ExtendedKeyPair, ExtendedPublicKey, ExtendedSecretKey, KeyPair, PublicKey, SecretKey } from '../types/key'
import { Complement } from '../types/meta/utility-types'
import { ProtocolNetwork } from '../types/protocol'
import { Secret } from '../types/secret'
import { Signature } from '../types/signature'
import {
  AirGapTransactionsWithCursor,
  SignedTransaction,
  TransactionConfiguration,
  TransactionCursor,
  TransactionDetails,
  UnsignedTransaction
} from '../types/transaction'

import { AirGapOfflineProtocol, AirGapOnlineProtocol, BaseGeneric, BaseProtocol, OfflineGeneric, OnlineGeneric } from './AirGapProtocol'

// ##### Type #####

interface BaseExtendedGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _AddressResult extends Address | AddressWithCursor<_AddressCursor> = Address | AddressWithCursor<_AddressCursor>,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseGeneric<_AddressCursor, _AddressResult, _SignedTransaction, _Units, _UnsignedTransaction> {}

interface OfflineExtendedGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _AddressResult extends Address | AddressWithCursor<_AddressCursor> = Address | AddressWithCursor<_AddressCursor>,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseExtendedGeneric<_AddressCursor, _AddressResult, _SignedTransaction, _Units, _UnsignedTransaction>,
    OfflineGeneric<_AddressCursor, _AddressResult, _SignedTransaction, _Units, _UnsignedTransaction> {}

interface OnlineExtendedGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _AddressResult extends Address | AddressWithCursor<_AddressCursor> = Address | AddressWithCursor<_AddressCursor>,
  _ProtocolNetwork extends ProtocolNetwork = ProtocolNetwork,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _TransactionCursor extends TransactionCursor = TransactionCursor,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseExtendedGeneric<_AddressCursor, _AddressResult, _SignedTransaction, _Units, _UnsignedTransaction>,
    OnlineGeneric<_AddressCursor, _AddressResult, _ProtocolNetwork, _SignedTransaction, _TransactionCursor, _Units, _UnsignedTransaction> {}

type TypedAddressCursor<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['AddressCursor']
type TypedAddressResult<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['AddressResult']
type TypedSignedTransaction<G extends Partial<BaseExtendedGeneric>> = Complement<BaseExtendedGeneric, G>['SignedTransaction']
type TypedTransactionCursor<G extends Partial<OnlineExtendedGeneric>> = Complement<OnlineExtendedGeneric, G>['TransactionCursor']
type TypedUnsignedTransaction<G extends Partial<BaseExtendedGeneric>> = Complement<BaseExtendedGeneric, G>['UnsignedTransaction']
type TypedUnits<G extends Partial<BaseExtendedGeneric>> = Complement<BaseExtendedGeneric, G>['Units']

// ##### Protocol #####

export interface BaseExtendedProtocol<G extends Partial<BaseExtendedGeneric> = {}> extends BaseProtocol<G> {
  getAddressFromPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<TypedAddressResult<G>>
  getNextAddressFromPublicKey?(
    publicKey: PublicKey | ExtendedPublicKey,
    cursor: TypedAddressCursor<G>
  ): Promise<AddressWithCursor<TypedAddressCursor<G>> | undefined>

  deriveFromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey, visibilityIndex: number, addressIndex: number): Promise<PublicKey>

  convertKeyFormat<K extends SecretKey | ExtendedSecretKey | PublicKey | ExtendedPublicKey>(
    key: K,
    target: { format: BytesStringFormat }
  ): Promise<K | undefined>

  verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey | ExtendedPublicKey): Promise<boolean>
  encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string>
}

export interface AirGapOfflineExtendedProtocol<G extends Partial<OfflineExtendedGeneric> = {}>
  extends BaseExtendedProtocol<G>,
    Omit<AirGapOfflineProtocol<G>, keyof BaseExtendedProtocol<G>> {
  getExtendedKeyPairFromSecret(secret: Secret, derivationPath?: string, password?: string): Promise<ExtendedKeyPair>

  signTransactionWithSecretKey(
    transaction: TypedUnsignedTransaction<G>,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<TypedSignedTransaction<G>>

  signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature>
  decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair | ExtendedKeyPair): Promise<string>
  encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string>
  decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string>
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
    details: TransactionDetails<TypedUnits<G>>[]
  ): Promise<FeeEstimation<TypedUnits<G>>>
  prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<TypedUnits<G>>[],
    configuration?: TransactionConfiguration<TypedUnits<G>>
  ): Promise<TypedUnsignedTransaction<G>>
}

export interface AirGapExtendedProtocol<G extends Partial<OfflineExtendedGeneric & OnlineExtendedGeneric> = {}>
  extends AirGapOfflineExtendedProtocol<G>,
    AirGapOnlineExtendedProtocol<G> {}

export type AirGapAnyExtendedProtocol<G extends Partial<OfflineExtendedGeneric & OnlineExtendedGeneric> = {}> =
  | AirGapOfflineExtendedProtocol<G>
  | AirGapOnlineExtendedProtocol<G>
