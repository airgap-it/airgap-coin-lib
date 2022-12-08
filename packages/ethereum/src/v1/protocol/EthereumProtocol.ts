import { assertNever, Domain } from '@airgap/coinlib-core'
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import {
  AirGapInterface,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  ExtendedKeyPair,
  ExtendedPublicKey,
  ExtendedSecretKey,
  FeeEstimation,
  KeyPair,
  newExtendedPublicKey,
  newExtendedSecretKey,
  newPublicKey,
  newSecretKey,
  PublicKey,
  RecursivePartial,
  Secret,
  SecretKey,
  Signature,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'

import { EtherscanInfoClient } from '../clients/info/EtherscanInfoClient'
import { AirGapNodeClient } from '../clients/node/AirGapNodeClient'
import { EthereumProtocolNetwork, EthereumProtocolOptions, EthereumUnits } from '../types/protocol'
import { EthereumSignedTransaction, EthereumTransactionCursor, EthereumUnsignedTransaction } from '../types/transaction'
import { convertExtendedPublicKey, convertExtendedSecretKey } from '../utils/key'
import { isTypedUnsignedTransaction } from '../utils/transaction'

import { DefaultEthereumBaseProtocolImpl, EthereumBaseProtocol } from './EthereumBaseProtocol'

// Interface

export interface EthereumProtocol extends AirGapInterface<EthereumBaseProtocol, 'Bip32OverridingExtension'> {}

// Implementation

class EthereumProtocolImpl extends DefaultEthereumBaseProtocolImpl implements EthereumProtocol {
  public constructor(options: RecursivePartial<EthereumProtocolOptions> = {}) {
    const completeOptions: EthereumProtocolOptions = createEthereumProtocolOptions(options.network)

    super(new AirGapNodeClient(completeOptions.network.rpcUrl), new EtherscanInfoClient(completeOptions.network.blockExplorerApi), {
      ...completeOptions,
      standardDerivationPath: `m/44'/60'/0'`
    })
  }

  // Common

  public async getAddressFromPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return super.getAddressFromPublicKey(this.nonExtendedPublicKey(publicKey))
  }

  public async deriveFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    return this.getPublicKeyFromExtendedPublicKey(extendedPublicKey, visibilityIndex, addressIndex)
  }

  public async getDetailsFromTransaction(
    transaction: EthereumSignedTransaction | EthereumUnsignedTransaction,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<EthereumUnits>[]> {
    if (publicKey.type === 'pub') {
      return super.getDetailsFromTransaction(transaction, publicKey)
    }

    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedTransaction(transaction)
      case 'unsigned':
        if (isTypedUnsignedTransaction(transaction)) {
          const dps: string[] = transaction.derivationPath.split('/')
          const derivedPublicKey: PublicKey = this.getPublicKeyFromExtendedPublicKey(
            publicKey,
            Number(dps[dps.length - 2]),
            Number(dps[dps.length - 1])
          )
          const ownAddress: string = await this.getAddressFromPublicKey(derivedPublicKey)

          return this.getDetailsFromTypedUnsignedTransaction(transaction, ownAddress)
        } else {
          const derivedPublicKey: PublicKey = this.getPublicKeyFromExtendedPublicKey(publicKey, 0, 0)
          const ownAddress: string = await this.getAddressFromPublicKey(derivedPublicKey)

          return this.getDetailsFromRawUnsignedTransaction(transaction, ownAddress)
        }
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.ETHEREUM, 'Unsupported transaction type.')
    }
  }

  public async verifyMessageWithPublicKey(
    message: string,
    signature: Signature,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<boolean> {
    return super.verifyMessageWithPublicKey(message, signature, this.nonExtendedPublicKey(publicKey))
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return super.encryptAsymmetricWithPublicKey(payload, this.nonExtendedPublicKey(publicKey))
  }

  // Offline

  public async getExtendedKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<ExtendedKeyPair> {
    switch (secret.type) {
      case 'hex':
        return this.getExtendedKeyPairFromHexSecret(secret.value, derivationPath)
      case 'mnemonic':
        return this.getExtendedKeyPairFromMnemonic(secret.value, derivationPath, secret.password)
      default:
        assertNever(secret)
        throw new UnsupportedError(Domain.BITCOIN, 'Unsupported secret type.')
    }
  }

  private async getExtendedKeyPairFromHexSecret(secret: string, derivationPath?: string): Promise<ExtendedKeyPair> {
    const node = this.bitcoinJS.lib.HDNode.fromSeedHex(secret, this.bitcoinJS.config.network)
    const derivedNode = derivationPath ? node.derivePath(derivationPath) : node

    return {
      secretKey: newExtendedSecretKey(derivedNode.toBase58(), 'encoded'),
      publicKey: newExtendedPublicKey(derivedNode.neutered().toBase58(), 'encoded')
    }
  }

  private async getExtendedKeyPairFromMnemonic(mnemonic: string, derivationPath?: string, password?: string): Promise<ExtendedKeyPair> {
    const secret: Buffer = mnemonicToSeed(mnemonic, password)

    return this.getExtendedKeyPairFromHexSecret(secret.toString('hex'), derivationPath)
  }

  public async signTransactionWithSecretKey(
    transaction: EthereumUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<EthereumSignedTransaction> {
    return super.signTransactionWithSecretKey(transaction, this.nonExtendedSecretKey(secretKey))
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature> {
    return super.signMessageWithKeyPair(message, {
      secretKey: this.nonExtendedSecretKey(keyPair.secretKey),
      publicKey: this.nonExtendedPublicKey(keyPair.publicKey)
    })
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair | ExtendedKeyPair): Promise<string> {
    return super.decryptAsymmetricWithKeyPair(payload, {
      secretKey: this.nonExtendedSecretKey(keyPair.secretKey),
      publicKey: this.nonExtendedPublicKey(keyPair.publicKey)
    })
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return super.encryptAESWithSecretKey(payload, this.nonExtendedSecretKey(secretKey))
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return super.decryptAESWithSecretKey(payload, this.nonExtendedSecretKey(secretKey))
  }

  // Online

  public async getTransactionsForPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    limit: number,
    cursor?: EthereumTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<EthereumTransactionCursor, EthereumUnits>> {
    return super.getTransactionsForPublicKey(this.nonExtendedPublicKey(publicKey), limit, cursor)
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<EthereumUnits>> {
    return super.getBalanceOfPublicKey(this.nonExtendedPublicKey(publicKey))
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: string[],
    configuration?: TransactionConfiguration<EthereumUnits>
  ): Promise<Amount<EthereumUnits>> {
    return super.getTransactionMaxAmountWithPublicKey(this.nonExtendedPublicKey(publicKey), to, configuration)
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<EthereumUnits>[]
  ): Promise<FeeEstimation<EthereumUnits>> {
    return super.getTransactionFeeWithPublicKey(this.nonExtendedPublicKey(publicKey), details)
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<EthereumUnits>[],
    configuration?: TransactionConfiguration<EthereumUnits>
  ): Promise<EthereumUnsignedTransaction> {
    return super.prepareTransactionWithPublicKey(this.nonExtendedPublicKey(publicKey), details, configuration)
  }

  // Custom

  private nonExtendedPublicKey(publicKey: PublicKey | ExtendedPublicKey): PublicKey {
    return publicKey.type === 'pub' ? publicKey : this.getPublicKeyFromExtendedPublicKey(publicKey)
  }

  private nonExtendedSecretKey(secretKey: SecretKey | ExtendedSecretKey): SecretKey {
    return secretKey.type === 'priv' ? secretKey : this.getSecretKeyFromExtendedSecretKey(secretKey)
  }

  private getPublicKeyFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number = 0,
    addressIndex: number = 0
  ): PublicKey {
    const encodedExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, 'encoded')
    const derivedNode = this.deriveNode(encodedExtendedPublicKey.value, visibilityIndex, addressIndex)

    return newPublicKey(derivedNode.neutered().keyPair.getPublicKeyBuffer().toString('hex'), 'hex')
  }

  private getSecretKeyFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number = 0,
    addressIndex: number = 0
  ): SecretKey {
    const encodedExtendedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(extendedSecretKey, 'encoded')
    const derivedNode = this.deriveNode(encodedExtendedSecretKey.value, visibilityIndex, addressIndex)

    return newSecretKey(derivedNode.keyPair.getPrivateKeyBuffer().toString('hex'), 'hex')
  }

  private deriveNode(base58: string, visibilityIndex?: number, addressIndex?: number): any {
    return [visibilityIndex, addressIndex].reduce(
      (node, index) => node.derive(index),
      this.bitcoinJS.lib.HDNode.fromBase58(base58, this.bitcoinJS.config.network)
    )
  }
}

// Factory

export function createEthereumProtocol(options: RecursivePartial<EthereumProtocolOptions> = {}): EthereumProtocol {
  return new EthereumProtocolImpl(options)
}

export const ETHEREUM_MAINNET_PROTOCOL_NETWORK: EthereumProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://eth-rpc-proxy.airgap.prod.gke.papers.tech',
  chainId: 1,
  blockExplorerApi: 'https://api.etherscan.io'
}

const DEFAULT_ETHEREUM_PROTOCOL_NETWORK: EthereumProtocolNetwork = ETHEREUM_MAINNET_PROTOCOL_NETWORK

export function createEthereumProtocolOptions(network: Partial<EthereumProtocolNetwork> = {}): EthereumProtocolOptions {
  return {
    network: { ...DEFAULT_ETHEREUM_PROTOCOL_NETWORK, ...network }
  }
}
