import { bytesToHex } from '@airgap/coinlib-core/utils/hex'
import {
  AddressWithCursor,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionStatus,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  BytesStringFormat,
  FeeEstimation,
  KeyPair,
  ProtocolMetadata,
  ProtocolNetwork,
  PublicKey,
  Secret,
  SecretKey,
  Signature,
  SignedTransaction,
  TransactionConfiguration,
  TransactionCursor,
  TransactionDetails,
  UnsignedTransaction
} from '@airgap/module-kit'
import { hash } from '@stablelib/blake2b'

import { MockProtocolOptions } from './MockProtocolOptions'

export class MockProtocol implements AirGapProtocol {
  constructor(private readonly options: MockProtocolOptions = new MockProtocolOptions()) {}

  public async getKeyPairFromSecret(secret: Secret, derivationPath?: string | undefined, password?: string | undefined): Promise<KeyPair> {
    throw new Error('Method not implemented.')
  }

  public async signTransactionWithSecretKey(transaction: UnsignedTransaction, secretKey: SecretKey): Promise<SignedTransaction> {
    throw new Error('Method not implemented.')
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    throw new Error('Method not implemented.')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getMetadata(): Promise<ProtocolMetadata<string>> {
    return {
      name: this.options.config.name ?? 'Dev',
      identifier: this.options.config.identifier ?? 'dev',
      units: this.options.config.units ?? {
        DEV: {
          symbol: { value: 'DEV' },
          decimals: 6
        }
      },
      mainUnit: this.options.config.mainUnit ?? 'DEV',
      account: {
        standardDerivationPath: this.options.config.standardDerivationPath ?? 'm/'
      }
    }
  }

  public async getNetwork(): Promise<ProtocolNetwork> {
    return this.options.network
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor> {
    const publicKeyBuffer: Buffer = Buffer.from(publicKey.value, publicKey.format === 'hex' ? 'hex' : 'utf-8')
    const address: Uint8Array = hash(publicKeyBuffer, 32)

    return {
      address: bytesToHex(address, { withPrefix: true }),
      cursor: { hasNext: false }
    }
  }

  public async convertKeyFormat<K extends SecretKey | PublicKey>(key: K, target: { format: BytesStringFormat }): Promise<K | undefined> {
    throw new Error('Method not implemented.')
  }

  public async getDetailsFromTransaction(transaction: SignedTransaction | UnsignedTransaction): Promise<AirGapTransaction[]> {
    throw new Error('Method not implemented.')
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: TransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor> {
    return {
      transactions: [],
      cursor: { hasNext: false }
    }
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: TransactionCursor | undefined
  ): Promise<AirGapTransactionsWithCursor> {
    return {
      transactions: [],
      cursor: { hasNext: false }
    }
  }

  public async getTransactionStatus(transactionIds: string[]): Promise<Record<string, AirGapTransactionStatus>> {
    throw new Error('Method not implemented.')
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<string>> {
    throw new Error('Method not implemented.')
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<string>> {
    throw new Error('Method not implemented.')
  }

  public async getTransactionMaxAmountWithPublicKey(publicKey: PublicKey, to: string[], fee?: Amount): Promise<Amount> {
    throw new Error('Method not implemented.')
  }

  public async getTransactionFeeWithPublicKey(publicKey: PublicKey, details: TransactionDetails[]): Promise<FeeEstimation> {
    throw new Error('Method not implemented.')
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails[],
    configuration?: TransactionConfiguration
  ): Promise<UnsignedTransaction> {
    throw new Error('Method not implemented.')
  }

  public async broadcastTransaction(transaction: SignedTransaction): Promise<string> {
    throw new Error('Method not implemented.')
  }
}
