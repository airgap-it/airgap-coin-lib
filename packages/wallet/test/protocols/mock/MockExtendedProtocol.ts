import { toHexBuffer } from '@airgap/coinlib-core/utils/hex'
import {
  AddressCursor,
  AddressWithCursor,
  AirGapExtendedProtocol,
  AirGapTransaction,
  AirGapTransactionStatus,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  ExtendedKeyPair,
  ExtendedSecretKey,
  ExtendedPublicKey,
  FeeEstimation,
  KeyPair,
  SecretKey,
  ProtocolMetadata,
  ProtocolNetwork,
  PublicKey,
  Secret,
  Signature,
  SignedTransaction,
  TransactionCursor,
  TransactionDetails,
  UnsignedTransaction
} from '@airgap/module-kit'

import { MockProtocol } from './MockProtocol'
import { MockProtocolOptions } from './MockProtocolOptions'

export class MockExtendedProtocol implements AirGapExtendedProtocol {
  private nonExtendedProtocol = new MockProtocol(this.options)

  constructor(private readonly options: MockProtocolOptions = new MockProtocolOptions()) {}

  public async getExtendedKeyPairFromSecret(
    secret: Secret,
    derivationPath?: string | undefined,
    password?: string | undefined
  ): Promise<ExtendedKeyPair> {
    throw new Error('Method not implemented.')
  }

  public async signTransactionWithSecretKey(
    transaction: UnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<SignedTransaction> {
    if (secretKey.type === 'priv') {
      return this.nonExtendedProtocol.signTransactionWithSecretKey(transaction, secretKey)
    }

    throw new Error('Method not implemented.')
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature> {
    if (keyPair.secretKey.type === 'priv' && keyPair.publicKey.type === 'pub') {
      return this.nonExtendedProtocol.signMessageWithKeyPair(message, keyPair as KeyPair)
    }

    throw new Error('Method not implemented.')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair | ExtendedKeyPair): Promise<string> {
    if (keyPair.secretKey.type === 'priv' && keyPair.publicKey.type === 'pub') {
      return this.nonExtendedProtocol.decryptAsymmetricWithKeyPair(payload, keyPair as KeyPair)
    }

    throw new Error('Method not implemented.')
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    if (secretKey.type === 'priv') {
      return this.nonExtendedProtocol.encryptAESWithSecretKey(payload, secretKey)
    }

    throw new Error('Method not implemented.')
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    if (secretKey.type === 'priv') {
      return this.nonExtendedProtocol.decryptAESWithSecretKey(payload, secretKey)
    }

    throw new Error('Method not implemented.')
  }

  public async deriveFromExtendedPublicKey(
    publicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    const publicKeyBuffer = Buffer.from(publicKey.value, publicKey.format === 'hex' ? 'hex' : 'utf-8')
    const visibilityIndexBuffer = toHexBuffer(visibilityIndex)
    const addressIndexBuffer = toHexBuffer(addressIndex)

    return {
      type: 'pub',
      format: 'hex',
      value: Buffer.concat([publicKeyBuffer, visibilityIndexBuffer, addressIndexBuffer]).toString('hex')
    }
  }

  public async convertKeyFormat<K extends SecretKey | ExtendedSecretKey | PublicKey | ExtendedPublicKey>(
    key: K,
    targetFormat: K['format']
  ): Promise<K | undefined> {
    if (key.type === 'priv' || key.type === 'pub') {
      return this.nonExtendedProtocol.convertKeyFormat(key, targetFormat) as any
    }

    throw new Error('Method not implemented.')
  }

  public async getNextAddressFromPublicKey(
    publicKey: ExtendedPublicKey,
    cursor: AddressCursor
  ): Promise<AddressWithCursor<AddressCursor> | undefined> {
    throw new Error('Method not implemented.')
  }

  public async verifyMessageWithPublicKey(
    message: string,
    signature: Signature,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<boolean> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.verifyMessageWithPublicKey(message, signature, publicKey)
    }

    throw new Error('Method not implemented.')
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.encryptAsymmetricWithPublicKey(payload, publicKey)
    }

    throw new Error('Method not implemented.')
  }

  public async getMetadata(): Promise<ProtocolMetadata<string>> {
    return this.nonExtendedProtocol.getMetadata()
  }

  public async getNetwork(): Promise<ProtocolNetwork> {
    return this.nonExtendedProtocol.getNetwork()
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor<AddressCursor>> {
    return this.nonExtendedProtocol.getAddressFromPublicKey(publicKey)
  }

  public async getDetailsFromTransaction(transaction: SignedTransaction | UnsignedTransaction): Promise<AirGapTransaction<string>[]> {
    return this.nonExtendedProtocol.getDetailsFromTransaction(transaction)
  }

  public async getKeyPairFromSecret(secret: Secret, derivationPath?: string | undefined, password?: string | undefined): Promise<KeyPair> {
    return this.nonExtendedProtocol.getKeyPairFromSecret(secret, derivationPath, password)
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: TransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<string, TransactionCursor>> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.getTransactionsForPublicKey(publicKey, limit, cursor)
    }

    throw new Error('Method not implemented.')
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<string>> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.getBalanceOfPublicKey(publicKey)
    }

    throw new Error('Method not implemented.')
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: string[],
    fee?: Amount<string> | undefined
  ): Promise<Amount<string>> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.getTransactionMaxAmountWithPublicKey(publicKey, to, fee)
    }

    throw new Error('Method not implemented.')
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<string>[]
  ): Promise<FeeEstimation<string>> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.getTransactionFeeWithPublicKey(publicKey, details)
    }

    throw new Error('Method not implemented.')
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<string>[],
    fee?: Amount<string> | undefined
  ): Promise<UnsignedTransaction> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.prepareTransactionWithPublicKey(publicKey, details, fee)
    }

    throw new Error('Method not implemented.')
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: TransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor<string, TransactionCursor>> {
    return this.nonExtendedProtocol.getTransactionsForAddresses(addresses, limit, cursor)
  }

  public async getTransactionStatus(transactionIds: string[]): Promise<Record<string, AirGapTransactionStatus>> {
    return this.nonExtendedProtocol.getTransactionStatus(transactionIds)
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<string>> {
    return this.nonExtendedProtocol.getBalanceOfAddresses(addresses)
  }

  public async broadcastTransaction(transaction: SignedTransaction): Promise<string> {
    return this.nonExtendedProtocol.broadcastTransaction(transaction)
  }
}
