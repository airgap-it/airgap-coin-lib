import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios, { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import * as rlp from '@airgap/coinlib-core/dependencies/src/rlp-2.2.3/index'
import { BalanceError, ConditionViolationError, NetworkError, UnsupportedError } from '@airgap/coinlib-core/errors'
import bs64check from '@airgap/coinlib-core/utils/base64Check'
import { toHexBuffer } from '@airgap/coinlib-core/utils/hex'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newPlainUIText,
  newPublicKey,
  newSecretKey,
  newSignature,
  newSignedTransaction,
  newUnsignedTransaction,
  normalizeToUndefined,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  Signature,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'
import { sign } from '@stablelib/ed25519'

import { AeternityAddress } from '../data/AeternityAddress'
import { AeternityCryptoConfiguration } from '../types/crypto'
import { AeternityProtocolNetwork, AeternityProtocolOptions, AeternityUnits } from '../types/protocol'
import { AeternitySignedTransaction, AeternityTransactionCursor, AeternityUnsignedTransaction } from '../types/transaction'
import { convertPublicKey } from '../utils/key'
import { convertSignature } from '../utils/signature'
import { decodeTx, encodeTx } from '../utils/transaction'

import { AeternityCryptoClient } from './AeternityCryptoClient'

// Interface

export interface AeternityProtocol
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: AeternityProtocolNetwork
      CryptoConfiguration: AeternityCryptoConfiguration
      SignedTransaction: AeternitySignedTransaction
      TransactionCursor: AeternityTransactionCursor
      Units: AeternityUnits
      FeeEstimation: FeeDefaults<AeternityUnits>
      UnsignedTransaction: AeternityUnsignedTransaction
    },
    'Crypto',
    'FetchDataForAddress'
  > {
  convertTransactionToBase58(preparedTx: AeternityUnsignedTransaction): Promise<AeternityUnsignedTransaction>
}

// Implementation

export class AeternityProtocolImpl implements AeternityProtocol {
  private readonly cryptoClient: AeternityCryptoClient
  private readonly options: AeternityProtocolOptions

  public constructor(options: RecursivePartial<AeternityProtocolOptions> = {}) {
    this.options = createAeternityProtocolOptions(options.network)
    this.cryptoClient = new AeternityCryptoClient()
  }

  // Common

  private readonly units: ProtocolUnitsMetadata<AeternityUnits> = {
    AE: {
      symbol: { value: 'AE', market: 'ae' },
      decimals: 18
    }
  }

  private readonly feeDefaults: FeeDefaults<AeternityUnits> = {
    low: newAmount(0.00021, 'AE').blockchain(this.units),
    medium: newAmount(0.000315, 'AE').blockchain(this.units),
    high: newAmount(0.00084, 'AE').blockchain(this.units)
  }

  private readonly metadata: ProtocolMetadata<AeternityUnits> = {
    identifier: MainProtocolSymbols.AE,
    name: 'æternity',

    units: this.units,
    mainUnit: 'AE',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m/44h/457h/0h/0h/0h`,
      address: {
        isCaseSensitive: true,
        placeholder: 'ak_abc...',
        regex: '^ak_+[1-9A-Za-z]{49,50}$'
      }
    },

    transaction: {
      arbitraryData: {
        inner: { name: 'payload' }
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<AeternityUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return AeternityAddress.from(publicKey).asString()
  }

  public async getDetailsFromTransaction(
    transaction: AeternitySignedTransaction | AeternityUnsignedTransaction,
    _publicKey: PublicKey
  ): Promise<AirGapTransaction<AeternityUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        const rlpEncodedTx = decodeTx(transaction.transaction)
        const rlpDecodedTx = rlp.decode(rlpEncodedTx, false)

        return this.getDetailsFromEncodedTransaction(`tx_${bs64check.encode(rlpDecodedTx[3])}`)
      case 'unsigned':
        return this.getDetailsFromEncodedTransaction(transaction.transaction)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.AETERNITY, 'Unsupported transaction type.')
    }
  }

  private async getDetailsFromEncodedTransaction(tx: string): Promise<AirGapTransaction<AeternityUnits>[]> {
    const rlpEncodedTx = decodeTx(tx)
    const rlpDecodedTx = rlp.decode(rlpEncodedTx, false)

    const from: string = await this.getAddressFromPublicKey(newPublicKey(rlpDecodedTx[2].slice(1).toString('hex'), 'hex'))
    const to: string = await this.getAddressFromPublicKey(newPublicKey(rlpDecodedTx[3].slice(1).toString('hex'), 'hex'))

    const airgapTx: AirGapTransaction<AeternityUnits> = {
      from: [from],
      to: [to],
      isInbound: false,

      amount: newAmount(parseInt(rlpDecodedTx[4].toString('hex'), 16), 'blockchain'),
      fee: newAmount(parseInt(rlpDecodedTx[5].toString('hex'), 16), 'blockchain'),

      network: this.options.network,

      arbitraryData: (rlpDecodedTx[8] || '').toString('utf8')
    }

    return [airgapTx]
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    const hexSignature: Signature = convertSignature(signature, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.verifyMessage(message, hexSignature.value, hexPublicKey.value)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.encryptAsymmetric(payload, hexPublicKey.value)
  }

  // Offline

  private readonly cryptoConfiguration: AeternityCryptoConfiguration = {
    algorithm: 'ed25519'
  }

  public async getCryptoConfiguration(): Promise<AeternityCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return {
      secretKey: newSecretKey(
        Buffer.concat([Buffer.from(derivative.secretKey, 'hex'), Buffer.from(derivative.publicKey, 'hex')]).toString('hex'),
        'hex'
      ),
      publicKey: newPublicKey(derivative.publicKey, 'hex')
    }
  }

  public async signTransactionWithSecretKey(
    transaction: AeternityUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<AeternitySignedTransaction> {
    if (secretKey.format !== 'hex') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Secret key is of an unexpected format.')
    }

    const rawTx = decodeTx(transaction.transaction)
    const signature = sign(Buffer.from(secretKey.value, 'hex'), Buffer.concat([Buffer.from(transaction.networkId), rawTx]))
    const txObj = {
      tag: toHexBuffer(11),
      version: toHexBuffer(1),
      signatures: [Buffer.from(signature)],
      transaction: rawTx
    }

    const txArray = Object.keys(txObj).map((a) => txObj[a])

    const rlpEncodedTx = rlp.encode(txArray)
    const signedEncodedTx = `tx_${bs64check.encode(rlpEncodedTx)}`

    return newSignedTransaction<AeternitySignedTransaction>({ transaction: signedEncodedTx })
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    if (keyPair.secretKey.format !== 'hex') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Secret key is of an unexpected format.')
    }

    return newSignature(await this.cryptoClient.signMessage(message, { privateKey: keyPair.secretKey.value }), 'hex')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string> {
    if (keyPair.secretKey.format !== 'hex') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Secret key is of an unexpected format.')
    }

    const hexPublicKey = convertPublicKey(keyPair.publicKey, 'hex')

    return this.cryptoClient.decryptAsymmetric(payload, { publicKey: hexPublicKey.value, privateKey: keyPair.secretKey.value })
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    if (secretKey.format !== 'hex') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Secret key is of an unexpected format.')
    }

    return this.cryptoClient.encryptAES(payload, secretKey.value)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    if (secretKey.format !== 'hex') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Secret key is of an unexpected format.')
    }

    return this.cryptoClient.decryptAES(payload, secretKey.value)
  }

  // Online

  public async getNetwork(): Promise<AeternityProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: AeternityTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<AeternityTransactionCursor, AeternityUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: AeternityTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<AeternityTransactionCursor, AeternityUnits>> {
    const endpoint = cursor === undefined ? `/txs/backward?account=${address}&limit=${limit}` : cursor.next
    const url = endpoint !== undefined ? `${this.options.network.rpcUrl}/mdw/${endpoint.replace(/^\/+/, '')}` : undefined
    const response = url !== undefined ? await axios.get(url) : undefined

    const nodeTransactions = response?.data?.data || []
    const next = normalizeToUndefined(response?.data?.next)

    const transactions: AirGapTransaction<AeternityUnits>[] = nodeTransactions.map((obj) => {
      const parsedTimestamp = parseInt(obj.micro_time, 10)

      return {
        from: [obj.tx.sender_id],
        to: [obj.tx.recipient_id],
        isInbound: address === obj.tx.recipient_id,

        amount: newAmount(obj.tx.amount, 'blockchain'),
        fee: newAmount(obj.tx.fee, 'blockchain'),

        network: this.options.network,

        timestamp: !isNaN(parsedTimestamp) ? Math.round(parsedTimestamp / 1000) : undefined,
        status: {
          type: 'unknown',
          hash: obj.hash,
          block: obj.block_height
        },

        details: obj.tx.payload ? [newPlainUIText('Payload'), obj.tx.payload] : undefined
      }
    })

    return {
      transactions,
      cursor: {
        hasNext: next !== undefined,
        next
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<AeternityUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<AeternityUnits>> {
    let balance: BigNumber

    try {
      const { data } = await axios.get(`${this.options.network.rpcUrl}/v2/accounts/${address}`)
      balance = new BigNumber(data.balance)
    } catch (error) {
      // if node returns 404 (which means 'no account found'), go with 0 balance
      if (error.response && error.response.status !== 404) {
        throw new NetworkError(Domain.AETERNITY, error as AxiosError)
      }
      balance = new BigNumber(0)
    }

    return { total: newAmount(balance.toString(10), 'blockchain') }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionFullConfiguration<AeternityUnits>
  ): Promise<Amount<AeternityUnits>> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const balanceBn = new BigNumber(newAmount(balance.total).blockchain(this.units).value)

    let fee: BigNumber
    if (configuration?.fee !== undefined) {
      fee = new BigNumber(newAmount(configuration.fee).blockchain(this.units).value)
    } else {
      const transactionDetails: TransactionDetails<AeternityUnits>[] = to.map((address) => ({
        to: address,
        amount: newAmount(balanceBn.div(to.length).toString(), 'blockchain')
      }))
      const feeEstimation: FeeDefaults<AeternityUnits> = await this.getTransactionFeeWithPublicKey(publicKey, transactionDetails)
      fee = new BigNumber(newAmount(feeEstimation.medium).blockchain(this.units).value)
      if (fee.gte(balanceBn)) {
        fee = new BigNumber(0)
      }
    }

    let amountWithoutFees = balanceBn.minus(fee)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return newAmount(amountWithoutFees.toFixed(), 'blockchain')
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<AeternityUnits>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<AeternityUnits>> {
    const feeDetaults = (await axios.get(this.options.network.feesUrl)).data

    return {
      low: newAmount(feeDetaults.low, 'AE').blockchain(this.units),
      medium: newAmount(feeDetaults.medium, 'AE').blockchain(this.units),
      high: newAmount(feeDetaults.high, 'AE').blockchain(this.units)
    }
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<AeternityUnits>[],
    configuration?: TransactionFullConfiguration<AeternityUnits>
  ): Promise<AeternityUnsignedTransaction> {
    // should we support multiple transactions here?

    let nonce = 1

    const address: string = await this.getAddressFromPublicKey(publicKey)

    try {
      const { data: accountResponse } = await axios.get(`${this.options.network.rpcUrl}/v2/accounts/${address}`)
      nonce = accountResponse.nonce + 1
    } catch (error) {
      // if node returns 404 (which means 'no account found'), go with nonce 0
      if (error.response && error.response.status !== 404) {
        throw new NetworkError(Domain.AETERNITY, error as AxiosError)
      }
    }

    const balance: Amount<AeternityUnits> = newAmount((await this.getBalanceOfPublicKey(publicKey)).total).blockchain(this.units)
    const balanceBn: BigNumber = new BigNumber(balance.value)
    const feeBn: BigNumber =
      configuration?.fee !== undefined
        ? new BigNumber(newAmount(configuration.fee).blockchain(this.units).value)
        : new BigNumber(newAmount(this.feeDefaults.medium).blockchain(this.units).value)

    if (balanceBn.isLessThan(feeBn)) {
      throw new BalanceError(Domain.AETERNITY, 'not enough balance')
    }

    const sender: string = convertPublicKey(publicKey, 'hex').value
    const recipient: string = convertPublicKey(AeternityAddress.from(details[0].to).toPublicKey(), 'hex').value
    const value: BigNumber = new BigNumber(newAmount(details[0].amount).blockchain(this.units).value)
    const payload: string = details[0].arbitraryData || ''

    const txObj = {
      tag: toHexBuffer(12),
      version: toHexBuffer(1),
      sender_id: Buffer.concat([toHexBuffer(1), Buffer.from(sender, 'hex')]),
      recipient_id: Buffer.concat([toHexBuffer(1), Buffer.from(recipient, 'hex')]),
      amount: toHexBuffer(value),
      fee: toHexBuffer(feeBn),
      ttl: toHexBuffer(0),
      nonce: toHexBuffer(nonce),
      payload: Buffer.from(payload)
    }

    const txArray = Object.keys(txObj).map((a) => txObj[a])
    const rlpEncodedTx = rlp.encode(txArray)
    const preparedTx = encodeTx(rlpEncodedTx)

    return newUnsignedTransaction<AeternityUnsignedTransaction>({
      transaction: preparedTx,
      networkId: this.networkId()
    })
  }

  private networkId(): string {
    switch (this.options.network.type) {
      case 'mainnet':
        return 'ae_mainnet'
      default:
        throw new ConditionViolationError(Domain.AETERNITY, 'Network type not supported.')
    }
  }

  public async broadcastTransaction(transaction: AeternitySignedTransaction): Promise<string> {
    const { data } = await axios.post(
      `${this.options.network.rpcUrl}/v2/transactions`,
      { tx: transaction.transaction },
      { headers: { 'Content-Type': 'application/json' } }
    )

    return data.tx_hash
  }

  // Custom

  public async convertTransactionToBase58(preparedTx: AeternityUnsignedTransaction): Promise<AeternityUnsignedTransaction> {
    return newUnsignedTransaction<AeternityUnsignedTransaction>({
      transaction: bs58check.encode(bs64check.decode(preparedTx.transaction)),
      networkId: preparedTx.networkId
    })
  }
}

// Factory

export function createAeternityProtocol(options: RecursivePartial<AeternityProtocolOptions> = {}): AeternityProtocol {
  return new AeternityProtocolImpl(options)
}

export const AETERNITY_MAINNET_PROTOCOL_NETWORK: AeternityProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://mainnet.aeternity.io',
  blockExplorerUrl: 'https://explorer.aeternity.io',
  feesUrl: 'https://api-airgap.gke.papers.tech/fees'
}

const DEFAULT_AETERNITY_PROTOCOL_NETWORK: AeternityProtocolNetwork = AETERNITY_MAINNET_PROTOCOL_NETWORK

export function createAeternityProtocolOptions(network: Partial<AeternityProtocolNetwork> = {}): AeternityProtocolOptions {
  return {
    network: { ...DEFAULT_AETERNITY_PROTOCOL_NETWORK, ...network }
  }
}
