import { Address, AddressCursor, AddressWithCursor } from '../types/address'
import { Amount } from '../types/amount'
import { Balance } from '../types/balance'
import { FeeEstimation } from '../types/fee'
import { KeyPair, PrivateKey, PublicKey } from '../types/key'
import { Complement } from '../types/meta/utility-types'
import { ProtocolMetadata, ProtocolNetwork } from '../types/protocol'
import { Secret } from '../types/secret'
import { Signature } from '../types/signature'
import {
  AirGapTransaction,
  AirGapTransactionStatus,
  AirGapTransactionsWithCursor,
  SignedTransaction,
  TransactionCursor,
  TransactionDetails,
  UnsignedTransaction
} from '../types/transaction'

// ##### Type #####

export interface BaseGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> {
  AddressCursor: _AddressCursor
  SignedTransaction: _SignedTransaction
  Units: _Units
  UnsignedTransaction: _UnsignedTransaction
}

export interface OfflineGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseGeneric<_AddressCursor, _SignedTransaction, _Units, _UnsignedTransaction> {}

export interface OnlineGeneric<
  _AddressCursor extends AddressCursor = AddressCursor,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _TransactionCursor extends TransactionCursor = TransactionCursor,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseGeneric<_AddressCursor, _SignedTransaction, _Units, _UnsignedTransaction> {
  TransactionCursor: _TransactionCursor
}

type TypedAddressCursor<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['AddressCursor']
type TypedSignedTransaction<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['SignedTransaction']
type TypedTransactionCursor<G extends Partial<OnlineGeneric>> = Complement<OnlineGeneric, G>['TransactionCursor']
type TypedUnsignedTransaction<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['UnsignedTransaction']
type TypedUnits<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['Units']

// ##### Protocol #####

export interface BaseProtocol<G extends Partial<BaseGeneric> = {}> {
  getMetadata(): Promise<ProtocolMetadata<TypedUnits<G>>>
  getNetwork(): Promise<ProtocolNetwork>

  getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor<TypedAddressCursor<G>>>

  convertKeyFormat<K extends PrivateKey | PublicKey, F extends K['format']>(
    key: K,
    targetFormat: F
  ): Promise<(Omit<K, 'format'> & { format: F }) | undefined>

  getDetailsFromTransaction(transaction: TypedUnsignedTransaction<G> | TypedSignedTransaction<G>): Promise<AirGapTransaction>

  verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean>
  encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string>
}

export interface AirGapOfflineProtocol<G extends Partial<OfflineGeneric> = {}> extends BaseProtocol<G> {
  getKeyPairFromSecret(secret: Secret, derivationPath?: string, password?: string): Promise<KeyPair>

  signTransactionWithPrivateKey(transaction: TypedUnsignedTransaction<G>, privateKey: PrivateKey): Promise<TypedSignedTransaction<G>>

  signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature>
  decryptAsymmetricWithPrivateKey(payload: string, privateKey: PrivateKey): Promise<string>
  encryptAESWithPrivateKey(payload: string, privateKey: PrivateKey): Promise<string>
  decryptAESWithPrivateKey(payload: string, privateKey: PrivateKey): Promise<string>
}

export interface AirGapOnlineProtocol<G extends Partial<OnlineGeneric> = {}> extends BaseProtocol<G> {
  getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: TypedTransactionCursor<G>
  ): Promise<AirGapTransactionsWithCursor<TypedUnits<G>, TypedTransactionCursor<G>>>
  getTransactionsForAddresses(
    addresses: Address[],
    limit: number,
    cursor?: TypedTransactionCursor<G>
  ): Promise<AirGapTransactionsWithCursor<TypedUnits<G>, TypedTransactionCursor<G>>>

  getTransactionStatus(transactionIds: string[]): Promise<AirGapTransactionStatus>

  getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<TypedUnits<G>>>
  getBalanceOfAddresses(addresses: Address[]): Promise<Balance<TypedUnits<G>>>

  getTransactionMaxAmountWithPublicKey(publicKey: PublicKey, to: Address[], fee?: Amount<TypedUnits<G>>): Promise<Amount<TypedUnits<G>>> // how should it be calulated? value distributed amongst addresses passed in in `to` or should we limit it to only one recipient?
  getTransactionFeeWithPublicKey(publicKey: PublicKey, details: TransactionDetails[]): Promise<FeeEstimation<TypedUnits<G>>>
  prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails[],
    fee?: Amount<TypedUnits<G>>
  ): Promise<TypedUnsignedTransaction<G>>

  broadcastTransaction(transaction: TypedSignedTransaction<G>): Promise<string>
}

export interface AirGapProtocol<G extends Partial<OfflineGeneric & OnlineGeneric> = {}>
  extends AirGapOfflineProtocol<G>,
    AirGapOnlineProtocol<G> {}

export type AirGapAnyProtocol<G extends Partial<OfflineGeneric & OnlineGeneric> = {}> = AirGapOfflineProtocol<G> | AirGapOnlineProtocol<G>
