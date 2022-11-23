import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios, { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import * as rlp from '@airgap/coinlib-core/dependencies/src/rlp-2.2.3/index'
import { generateWalletUsingDerivationPath } from '@airgap/coinlib-core/dependencies/src/hd-wallet-js-b216450e56954a6e82ace0aade9474673de5d9d5/src/index'
import bs64check from '@airgap/coinlib-core/utils/base64Check'
import {
  AddressWithCursor,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  FeeDefaults,
  FeeEstimation,
  KeyPair,
  SecretKey,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  Secret,
  Signature,
  TransactionDetails,
  RecursivePartial,
  amount,
  publicKey,
  secretKey,
  signedTransaction,
  signature,
  plainUIText,
  isAmount,
  unsignedTransaction
} from '@airgap/module-kit'
import { sign } from '@stablelib/ed25519'

import { AeternityAddress, AeternityAddressCursor } from '../types/address'
import { AeternityUnits } from '../types/protocol'
import { AeternitySignedTransaction, AeternityTransactionCursor, AeternityUnsignedTransaction } from '../types/transaction'
import { convertPublicKey } from '../utils/key'
import { decodeTx, encodeTx } from '../utils/transaction'
import { AeternityProtocolNetwork, createAeternityProtocolOptions, AeternityProtocolOptions } from './AeternityProtocolOptions'
import { AeternityCryptoClient } from './AeternityCryptoClient'
import { convertSignature } from '../utils/signature'
import { BalanceError, ConditionViolationError, NetworkError } from '@airgap/coinlib-core/errors'
import { toHexBuffer } from '@airgap/coinlib-core/utils/hex'

// Interface

export interface AeternityProtocol
  extends AirGapProtocol<{
    AddressCursor: AeternityAddressCursor
    ProtocolNetwork: AeternityProtocolNetwork
    SignedTransaction: AeternitySignedTransaction
    TransactionCursor: AeternityTransactionCursor
    Units: AeternityUnits
    UnsignedTransaction: AeternityUnsignedTransaction
  }> {
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
    low: amount(0.00021, 'AE').blockchain(this.units),
    medium: amount(0.000315, 'AE').blockchain(this.units),
    high: amount(0.00084, 'AE').blockchain(this.units)
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
        name: 'payload'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<AeternityUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor<AeternityAddressCursor>> {
    return {
      address: AeternityAddress.from(publicKey).asString(),
      cursor: { hasNext: false }
    }
  }

  public async convertKeyFormat<K extends SecretKey | PublicKey>(key: K, targetFormat: K['format']): Promise<K | undefined> {
    if (key.format === targetFormat) {
      return key
    }

    if (key.type === 'pub') {
      return Object.assign(key, convertPublicKey(key, targetFormat))
    }

    /* private keys are not supported */
    return undefined
  }

  public async getDetailsFromTransaction(
    transaction: AeternitySignedTransaction | AeternityUnsignedTransaction
  ): Promise<AirGapTransaction<AeternityUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        const rlpEncodedTx = decodeTx(transaction.transaction)
        const rlpDecodedTx = rlp.decode(rlpEncodedTx, false)

        return this.getDetailsFromEncodedTransaction(`tx_${bs64check.encode(rlpDecodedTx[3])}`)
      case 'unsigned':
        return this.getDetailsFromEncodedTransaction(transaction.transaction)
    }
  }

  private async getDetailsFromEncodedTransaction(tx: string): Promise<AirGapTransaction<AeternityUnits>[]> {
    const rlpEncodedTx = decodeTx(tx)
    const rlpDecodedTx = rlp.decode(rlpEncodedTx, false)

    const from: AddressWithCursor = await this.getAddressFromPublicKey(publicKey(rlpDecodedTx[2].slice(1).toString('hex'), 'hex'))
    const to: AddressWithCursor = await this.getAddressFromPublicKey(publicKey(rlpDecodedTx[3].slice(1).toString('hex'), 'hex'))

    const airgapTx: AirGapTransaction<AeternityUnits> = {
      from: [from.address],
      to: [to.address],
      isInbound: false,

      amount: amount(parseInt(rlpDecodedTx[4].toString('hex'), 16), 'blockchain'),
      fee: amount(parseInt(rlpDecodedTx[5].toString('hex'), 16), 'blockchain'),

      network: this.options.network,

      details: [plainUIText('payload'), (rlpDecodedTx[8] || '').toString('utf8')]
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

  public async getKeyPairFromSecret(secret: Secret, derivationPath?: string, password?: string): Promise<KeyPair> {
    switch (secret.type) {
      case 'hex':
        return this.getKeyPairFromHexSecret(secret.value, derivationPath)
      case 'mnemonic':
        return this.getKeyPairFromMnemonic(secret.value, derivationPath, password)
    }
  }

  private async getKeyPairFromHexSecret(secret: string, derivationPath?: string): Promise<KeyPair> {
    const keyPair = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)

    return {
      secretKey: secretKey(Buffer.from(keyPair.secretKey).toString('hex'), 'hex'),
      publicKey: publicKey(Buffer.from(keyPair.publicKey).toString('hex'), 'hex')
    }
  }

  private async getKeyPairFromMnemonic(mnemonic: string, derivationPath?: string, password?: string): Promise<KeyPair> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getKeyPairFromHexSecret(secret.toString('hex'), derivationPath)
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

    return signedTransaction<AeternitySignedTransaction>({ transaction: signedEncodedTx })
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    if (keyPair.secretKey.format !== 'hex') {
      throw new ConditionViolationError(Domain.AETERNITY, 'Secret key is of an unexpected format.')
    }

    return signature(await this.cryptoClient.signMessage(message, { privateKey: keyPair.secretKey.value }), 'hex')
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
  ): Promise<AirGapTransactionsWithCursor<'AE', AeternityTransactionCursor>> {
    const addressWithCursor: AddressWithCursor<AeternityAddressCursor> = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddresses([addressWithCursor.address], limit, cursor)
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: AeternityTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<'AE', AeternityTransactionCursor>> {
    const groupedTransactions = await Promise.all(
      addresses.map(async (address) => {
        const endpoint = cursor === undefined ? `/txs/backward?account=${address}&limit=${limit}` : cursor.next[address]
        const url = endpoint !== undefined ? `${this.options.network.rpcUrl}/mdw/${endpoint.replace(/^\/+/, '')}` : undefined
        const response = url !== undefined ? await axios.get(url) : undefined

        return {
          address,
          data: response?.data
        }
      })
    )

    const [next, allTransactions] = groupedTransactions.reduce(
      (acc, curr) => {
        const nextAcc = curr.data?.next ? Object.assign(acc[0], { [curr.address]: curr.data.next }) : acc[0]
        const transactionsAcc = acc[1].concat(curr.data?.data || [])

        return [nextAcc, transactionsAcc]
      },
      [{}, [] as any[]]
    )

    const transactions: AirGapTransaction<AeternityUnits>[] = allTransactions.map((obj) => {
      const parsedTimestamp = parseInt(obj.micro_time, 10)

      return {
        from: [obj.tx.sender_id],
        to: [obj.tx.recipient_id],
        isInbound: addresses.indexOf(obj.tx.recipient_id) !== -1,

        amount: amount(obj.tx.amount, 'blockchain'),
        fee: amount(obj.tx.fee, 'blockchain'),

        network: this.options.network,

        timestamp: !isNaN(parsedTimestamp) ? Math.round(parsedTimestamp / 1000) : undefined,
        status: {
          type: 'unknown',
          hash: obj.hash,
          block: obj.block_height
        },

        details: obj.tx.payload ? [plainUIText('Payload'), obj.tx.payload] : undefined
      }
    })

    return {
      transactions,
      cursor: {
        hasNext: Object.values(next).some((value) => value !== undefined),
        next
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<AeternityUnits>> {
    const address: AddressWithCursor<AeternityAddressCursor> = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address.address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<AeternityUnits>> {
    let balance = new BigNumber(0)

    for (const address of addresses) {
      try {
        const { data } = await axios.get(`${this.options.network.rpcUrl}/v2/accounts/${address}`)
        balance = balance.plus(new BigNumber(data.balance))
      } catch (error) {
        // if node returns 404 (which means 'no account found'), go with 0 balance
        if (error.response && error.response.status !== 404) {
          throw new NetworkError(Domain.AETERNITY, error as AxiosError)
        }
      }
    }

    return { total: amount(balance.toString(10), 'blockchain') }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    fee?: Amount<AeternityUnits>
  ): Promise<Amount<AeternityUnits>> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const balanceBn = new BigNumber(amount(balance.total).blockchain(this.units).value)

    let maxFee: BigNumber
    if (fee !== undefined) {
      maxFee = new BigNumber(amount(fee).blockchain(this.units).value)
    } else {
      const transactionDetails: TransactionDetails<AeternityUnits>[] = to.map((address) => ({
        to: address,
        amount: amount(balanceBn.div(to.length).toString(), 'blockchain')
      }))
      const feeEstimation: FeeEstimation<AeternityUnits> = await this.getTransactionFeeWithPublicKey(publicKey, transactionDetails)
      const mediumFee: Amount<AeternityUnits> = isAmount(feeEstimation) ? feeEstimation : feeEstimation.medium
      maxFee = new BigNumber(amount(mediumFee).blockchain(this.units).value)
      if (maxFee.gte(balanceBn)) {
        maxFee = new BigNumber(0)
      }
    }

    let amountWithoutFees = balanceBn.minus(maxFee)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return amount(amountWithoutFees.toFixed(), 'blockchain')
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<AeternityUnits>[]
  ): Promise<FeeEstimation<AeternityUnits>> {
    const feeDetaults = (await axios.get(this.options.network.feesUrl)).data

    return {
      low: amount(feeDetaults.low, 'AE').blockchain(this.units),
      medium: amount(feeDetaults.medium, 'AE').blockchain(this.units),
      high: amount(feeDetaults.high, 'AE').blockchain(this.units)
    }
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<AeternityUnits>[],
    fee?: Amount<AeternityUnits>
  ): Promise<AeternityUnsignedTransaction> {
    // should we support multiple transactions here?

    let nonce = 1

    const address: AddressWithCursor<AeternityAddressCursor> = await this.getAddressFromPublicKey(publicKey)

    try {
      const { data: accountResponse } = await axios.get(`${this.options.network.rpcUrl}/v2/accounts/${address.address}`)
      nonce = accountResponse.nonce + 1
    } catch (error) {
      // if node returns 404 (which means 'no account found'), go with nonce 0
      if (error.response && error.response.status !== 404) {
        throw new NetworkError(Domain.AETERNITY, error as AxiosError)
      }
    }

    const balance: Amount<AeternityUnits> = amount((await this.getBalanceOfPublicKey(publicKey)).total).blockchain(this.units)
    const balanceBn: BigNumber = new BigNumber(balance.value)
    const feeBn: BigNumber =
      fee !== undefined
        ? new BigNumber(amount(fee).blockchain(this.units).value)
        : new BigNumber(amount(this.feeDefaults.medium).blockchain(this.units).value)

    if (balanceBn.isLessThan(feeBn)) {
      throw new BalanceError(Domain.AETERNITY, 'not enough balance')
    }

    const sender: string = convertPublicKey(publicKey, 'hex').value
    const recipient: string = convertPublicKey(AeternityAddress.from(details[0].to).toPublicKey(), 'hex').value
    const value: BigNumber = new BigNumber(amount(details[0].amount).blockchain(this.units).value)
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

    return unsignedTransaction<AeternityUnsignedTransaction>({
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
    return unsignedTransaction<AeternityUnsignedTransaction>({
      transaction: bs58check.encode(bs64check.decode(preparedTx.transaction)),
      networkId: preparedTx.networkId
    })
  }
}

// Factory

export function createAeternityProtocol(options: RecursivePartial<AeternityProtocolOptions> = {}): AeternityProtocol {
  return new AeternityProtocolImpl(options)
}
