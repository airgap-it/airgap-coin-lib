import { toHexBuffer } from '@airgap/coinlib-core/utils/hex'
import {
  AddressWithCursor,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionStatus,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoConfiguration,
  CryptoDerivative,
  ExtendedKeyPair,
  ExtendedPublicKey,
  ExtendedSecretKey,
  FeeEstimation,
  KeyPair,
  ProtocolMetadata,
  ProtocolNetwork,
  PublicKey,
  SecretKey,
  Signature,
  SignedTransaction,
  TransactionFullConfiguration,
  TransactionCursor,
  TransactionDetails,
  UnsignedTransaction,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'

import { MockProtocol } from './MockProtocol'
import { MockProtocolOptions } from './MockProtocolOptions'

export class MockExtendedProtocol implements AirGapProtocol<{}, 'Bip32'> {
  private nonExtendedProtocol = new MockProtocol(this.options)

  constructor(private readonly options: MockProtocolOptions = new MockProtocolOptions()) {}

  public async getCryptoConfiguration(): Promise<CryptoConfiguration> {
    if (this.options.config.crypto) {
      return this.options.config.crypto
    }

    throw new Error('Method not implemented.')
  }

  public async getExtendedKeyPairFromDerivative(derivative: CryptoDerivative): Promise<ExtendedKeyPair> {
    throw new Error('Method not implemented.')
  }

  public async deriveFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<SecretKey> {
    const extendedSecretKeyBuffer = Buffer.from(extendedSecretKey.value, extendedSecretKey.format === 'hex' ? 'hex' : 'utf-8')
    const visibilityIndexBuffer = toHexBuffer(visibilityIndex)
    const addressIndexBuffer = toHexBuffer(addressIndex)

    return {
      type: 'priv',
      format: 'hex',
      value: Buffer.concat([extendedSecretKeyBuffer, visibilityIndexBuffer, addressIndexBuffer]).toString('hex')
    }
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
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    const extendedPublicKeyBuffer = Buffer.from(extendedPublicKey.value, extendedPublicKey.format === 'hex' ? 'hex' : 'utf-8')
    const visibilityIndexBuffer = toHexBuffer(visibilityIndex)
    const addressIndexBuffer = toHexBuffer(addressIndex)

    return {
      type: 'pub',
      format: 'hex',
      value: Buffer.concat([extendedPublicKeyBuffer, visibilityIndexBuffer, addressIndexBuffer]).toString('hex')
    }
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

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor> {
    return this.nonExtendedProtocol.getAddressFromPublicKey(publicKey)
  }

  public async getDetailsFromTransaction(transaction: SignedTransaction | UnsignedTransaction): Promise<AirGapTransaction[]> {
    return this.nonExtendedProtocol.getDetailsFromTransaction(transaction)
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return this.nonExtendedProtocol.getKeyPairFromDerivative(derivative)
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: TransactionCursor
  ): Promise<AirGapTransactionsWithCursor> {
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
    configuration?: TransactionFullConfiguration
  ): Promise<Amount> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.getTransactionMaxAmountWithPublicKey(publicKey, to, configuration)
    }

    throw new Error('Method not implemented.')
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails[],
    configuration?: TransactionSimpleConfiguration
  ): Promise<FeeEstimation> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.getTransactionFeeWithPublicKey(publicKey, details, configuration)
    }

    throw new Error('Method not implemented.')
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails[],
    configuration?: TransactionFullConfiguration
  ): Promise<UnsignedTransaction> {
    if (publicKey.type === 'pub') {
      return this.nonExtendedProtocol.prepareTransactionWithPublicKey(publicKey, details, configuration)
    }

    throw new Error('Method not implemented.')
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: TransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor> {
    return this.nonExtendedProtocol.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionStatus(transactionIds: string[]): Promise<Record<string, AirGapTransactionStatus>> {
    return this.nonExtendedProtocol.getTransactionStatus(transactionIds)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<string>> {
    return this.nonExtendedProtocol.getBalanceOfAddress(address)
  }

  public async broadcastTransaction(transaction: SignedTransaction): Promise<string> {
    return this.nonExtendedProtocol.broadcastTransaction(transaction)
  }
}
