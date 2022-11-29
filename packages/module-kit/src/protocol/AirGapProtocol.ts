import { Address, AddressCursor, AddressWithCursor } from '../types/address'
import { Amount } from '../types/amount'
import { Balance } from '../types/balance'
import { BytesStringFormat } from '../types/bytes'
import { FeeEstimation } from '../types/fee'
import { KeyPair, PublicKey, SecretKey } from '../types/key'
import { Complement } from '../types/meta/utility-types'
import { ProtocolMetadata, ProtocolNetwork } from '../types/protocol'
import { Secret } from '../types/secret'
import { Signature } from '../types/signature'
import {
  AirGapTransaction,
  AirGapTransactionStatus,
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
  _ProtocolNetwork extends ProtocolNetwork = ProtocolNetwork,
  _SignedTransaction extends SignedTransaction = SignedTransaction,
  _TransactionCursor extends TransactionCursor = TransactionCursor,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> extends BaseGeneric<_AddressCursor, _SignedTransaction, _Units, _UnsignedTransaction> {
  ProtocolNetwork: _ProtocolNetwork
  TransactionCursor: _TransactionCursor
}

type TypedAddressCursor<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['AddressCursor']
type TypedProtocolNetwork<G extends Partial<OnlineGeneric>> = Complement<OnlineGeneric, G>['ProtocolNetwork']
type TypedSignedTransaction<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['SignedTransaction']
type TypedTransactionCursor<G extends Partial<OnlineGeneric>> = Complement<OnlineGeneric, G>['TransactionCursor']
type TypedUnsignedTransaction<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['UnsignedTransaction']
type TypedUnits<G extends Partial<BaseGeneric>> = Complement<BaseGeneric, G>['Units']

// ##### Protocol #####

export interface BaseProtocol<G extends Partial<BaseGeneric> = {}> {
  getMetadata(): Promise<ProtocolMetadata<TypedUnits<G>>>

  getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor<TypedAddressCursor<G>>>

  convertKeyFormat<K extends SecretKey | PublicKey>(key: K, target: { format: BytesStringFormat }): Promise<K | undefined>

  getDetailsFromTransaction(
    transaction: TypedUnsignedTransaction<G> | TypedSignedTransaction<G>
  ): Promise<AirGapTransaction<TypedUnits<G>>[]>

  verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean>
  encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string>
}

export interface AirGapOfflineProtocol<G extends Partial<OfflineGeneric> = {}> extends BaseProtocol<G> {
  getKeyPairFromSecret(secret: Secret, derivationPath?: string, password?: string): Promise<KeyPair>

  signTransactionWithSecretKey(transaction: TypedUnsignedTransaction<G>, secretKey: SecretKey): Promise<TypedSignedTransaction<G>>

  signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature>
  decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string>
  encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string>
  decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string>
}

export interface AirGapOnlineProtocol<G extends Partial<OnlineGeneric> = {}> extends BaseProtocol<G> {
  getNetwork(): Promise<TypedProtocolNetwork<G>>

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

  getTransactionStatus?(transactionIds: string[]): Promise<Record<string, AirGapTransactionStatus>>

  getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<TypedUnits<G>>>
  getBalanceOfAddresses(addresses: Address[]): Promise<Balance<TypedUnits<G>>>

  getTransactionMaxAmountWithPublicKey(publicKey: PublicKey, to: Address[], fee?: Amount<TypedUnits<G>>): Promise<Amount<TypedUnits<G>>> // how should it be calulated? value distributed amongst addresses passed in in `to` or should we limit it to only one recipient?
  getTransactionFeeWithPublicKey(publicKey: PublicKey, details: TransactionDetails<TypedUnits<G>>[]): Promise<FeeEstimation<TypedUnits<G>>>
  prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<TypedUnits<G>>[],
    configuration?: TransactionConfiguration<TypedUnits<G>>
  ): Promise<TypedUnsignedTransaction<G>>

  broadcastTransaction(transaction: TypedSignedTransaction<G>): Promise<string>
}

export interface AirGapProtocol<G extends Partial<OfflineGeneric & OnlineGeneric> = {}>
  extends AirGapOfflineProtocol<G>,
    AirGapOnlineProtocol<G> {}

export type AirGapAnyProtocol<G extends Partial<OfflineGeneric & OnlineGeneric> = {}> = AirGapOfflineProtocol<G> | AirGapOnlineProtocol<G>
