import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios, { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import * as BigInteger from '@airgap/coinlib-core/dependencies/src/bigi-1.4.2'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import * as bitcoinMessage from '@airgap/coinlib-core/dependencies/src/bitcoinjs-message-2.1.1/index'
import * as BitGo from '@airgap/coinlib-core/dependencies/src/bitgo-utxo-lib-5d91049fd7a988382df81c8260e244ee56d57aac/src/index'
import { BalanceError, ConditionViolationError, InvalidValueError, NetworkError, UnsupportedError } from '@airgap/coinlib-core/errors'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  ExtendedKeyPair,
  ExtendedPublicKey,
  ExtendedSecretKey,
  FeeDefaults,
  KeyPair,
  newAmount,
  newExtendedPublicKey,
  newExtendedSecretKey,
  newPublicKey,
  newSecretKey,
  newSignature,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  Secret,
  SecretKey,
  Signature,
  SignedTransaction,
  TransactionConfiguration,
  TransactionDetails,
  UnsignedTransaction
} from '@airgap/module-kit'

import { BitcoinAddress } from '../data/BitcoinAddress'
import { BitcoinJS } from '../types/bitcoinjs'
import { AddressResponse, UTXOResponse, XPubResponse } from '../types/indexer'
import { BitcoinExtendedPublicKeyEncoding } from '../types/key'
import { BitcoinProtocolNetwork, BitcoinProtocolOptions, BitcoinStandardProtocolNetwork, BitcoinUnits } from '../types/protocol'
import { BitcoinSignedTransaction, BitcoinTransactionCursor, BitcoinUnsignedTransaction } from '../types/transaction'
import { containsSome } from '../utils/common'
import { convertExtendedPublicKey, convertExtendedSecretKey, convertPublicKey, convertSecretKey } from '../utils/key'
import { getBitcoinJSNetwork } from '../utils/network'
import { convertSignature } from '../utils/signature'

import { BitcoinCryptoClient } from './BitcoinCryptoClient'

// Interface

export interface BitcoinProtocol<
  _SignedTransaction extends SignedTransaction = BitcoinSignedTransaction,
  _UnsignedTransaction extends UnsignedTransaction = BitcoinUnsignedTransaction
> extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: BitcoinProtocolNetwork
      SignedTransaction: _SignedTransaction
      TransactionCursor: BitcoinTransactionCursor
      Units: BitcoinUnits
      FeeEstimation: FeeDefaults<BitcoinUnits>
      UnsignedTransaction: _UnsignedTransaction
    },
    'Bip32',
    'Crypto',
    'FetchDataForAddress',
    'FetchDataForMultipleAddresses'
  > {}

// Implementation

const DUST_AMOUNT: number = 50

export class BitcoinProtocolImpl implements BitcoinProtocol {
  private readonly options: BitcoinProtocolOptions
  private readonly cryptoClient: BitcoinCryptoClient
  public readonly bitcoinJS: BitcoinJS

  constructor(options: RecursivePartial<BitcoinProtocolOptions> = {}, bitcoinJS: any = BitGo, bitcoinJSMessage: any = bitcoinMessage) {
    this.options = createBitcoinProtocolOptions(options.network)
    this.bitcoinJS = {
      lib: bitcoinJS,
      message: bitcoinJSMessage,
      config: {
        network: getBitcoinJSNetwork(this.options.network, bitcoinJS)
      }
    }

    this.cryptoClient = new BitcoinCryptoClient(this, this.bitcoinJS)
  }

  // Common

  public readonly units: ProtocolUnitsMetadata<BitcoinUnits> = {
    BTC: {
      symbol: { value: 'BTC', market: 'btc' },
      decimals: 8
    },
    mBTC: {
      symbol: { value: 'mBTC' },
      decimals: 4
    },
    Satoshi: {
      symbol: { value: 'Satoshi' },
      decimals: 0
    }
  }

  public readonly feeDefaults: FeeDefaults<BitcoinUnits> = {
    low: newAmount(0.00002, 'BTC').blockchain(this.units),
    medium: newAmount(0.00004, 'BTC').blockchain(this.units),
    high: newAmount(0.00005, 'BTC').blockchain(this.units)
  }

  public readonly metadata: ProtocolMetadata<BitcoinUnits> = {
    identifier: MainProtocolSymbols.BTC,
    name: 'Bitcoin (Legacy)',

    units: this.units,
    mainUnit: 'BTC',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m/44'/0'/0'`,
      address: {
        isCaseSensitive: true,
        placeholder: '1ABC...',
        regex: '^(?:[13]{1}[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<BitcoinUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    switch (publicKey.type) {
      case 'pub':
        return this.getAddressFromNonExtendedPublicKey(publicKey)
      case 'xpub':
        return this.getAddressFromExtendedPublicKey(publicKey)
      default:
        assertNever(publicKey)
        throw new UnsupportedError(Domain.BITCOIN, 'Public key type is not supported.')
    }
  }

  private async getAddressFromNonExtendedPublicKey(publicKey: PublicKey): Promise<string> {
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')
    const keyPair = this.bitcoinJS.lib.ECPair.fromPublicKeyBuffer(Buffer.from(hexPublicKey.value, 'hex'), this.bitcoinJS.config.network)

    return BitcoinAddress.fromECPair(keyPair).asString()
  }

  private async getAddressFromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey): Promise<string> {
    const encodedExtendedPublicKey: ExtendedPublicKey = this.convertExtendedPublicKey(extendedPublicKey, 'encoded')
    const node = this.bitcoinJS.lib.HDNode.fromBase58(encodedExtendedPublicKey.value, this.bitcoinJS.config.network)

    return BitcoinAddress.fromHDNode(node).asString()
  }

  public async deriveFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    const encodedExtendedPublicKey: ExtendedPublicKey = this.convertExtendedPublicKey(extendedPublicKey, 'encoded')
    const childPublicKey: Buffer = this.bitcoinJS.lib.HDNode.fromBase58(encodedExtendedPublicKey.value, this.bitcoinJS.config.network)
      .derive(visibilityIndex)
      .derive(addressIndex)
      .getPublicKeyBuffer()

    return newPublicKey(childPublicKey.toString('hex'), 'hex')
  }

  public async getDetailsFromTransaction(
    transaction: BitcoinSignedTransaction | BitcoinUnsignedTransaction,
    _publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<BitcoinUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedTransaction(transaction)
      case 'unsigned':
        return this.getDetailsFromUnsignedTransaction(transaction)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.BITCOIN, 'Unsupported transaction type.')
    }
  }

  private async getDetailsFromSignedTransaction(transaction: BitcoinSignedTransaction): Promise<AirGapTransaction<BitcoinUnits>[]> {
    const tx: AirGapTransaction<BitcoinUnits> = {
      from: transaction.from,
      to: [] as string[],
      isInbound: false,

      amount: newAmount(transaction.amount, 'blockchain'),
      fee: newAmount(transaction.fee, 'blockchain'),

      network: this.options.network
    }

    const bitcoinTx = this.bitcoinJS.lib.Transaction.fromHex(transaction.transaction)
    bitcoinTx.outs.forEach((output) => {
      const address = this.bitcoinJS.lib.address.fromOutputScript(output.script, this.bitcoinJS.config.network)
      // only works if one output is target and rest is change, but this way we can filter out change addresses
      if (new BigNumber(output.value).isEqualTo(transaction.amount)) {
        tx.to.push(address)
      }
    })

    return [tx]
  }

  private async getDetailsFromUnsignedTransaction(transaction: BitcoinUnsignedTransaction): Promise<AirGapTransaction<BitcoinUnits>[]> {
    let fee: BigNumber = new BigNumber(0)

    for (const txIn of transaction.ins) {
      fee = fee.plus(new BigNumber(txIn.value))
    }

    for (const txOut of transaction.outs) {
      fee = fee.minus(new BigNumber(txOut.value))
    }

    return [
      {
        from: transaction.ins.map((obj) => obj.address),
        to: transaction.outs.filter((obj) => !obj.isChange).map((obj) => obj.recipient),
        isInbound: false,

        amount: newAmount(
          transaction.outs
            .filter((obj) => !obj.isChange)
            .map((obj) => new BigNumber(obj.value))
            .reduce((accumulator, currentValue) => accumulator.plus(currentValue)),
          'blockchain'
        ),
        fee: newAmount(fee, 'blockchain'),

        network: this.options.network
      }
    ]
  }

  public async verifyMessageWithPublicKey(
    message: string,
    signature: Signature,
    publicKey: ExtendedPublicKey | PublicKey
  ): Promise<boolean> {
    const encodedSignature: Signature = convertSignature(signature, 'encoded')

    return this.cryptoClient.verifyMessage(message, encodedSignature.value, publicKey.value)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: ExtendedPublicKey | PublicKey): Promise<string> {
    const nonExtendedPublicKey: PublicKey = publicKey.type === 'pub' ? publicKey : await this.deriveFromExtendedPublicKey(publicKey, 0, 0)

    const hexNonExtendedPublicKey: PublicKey = convertPublicKey(nonExtendedPublicKey, 'hex')

    return this.cryptoClient.encryptAsymmetric(payload, hexNonExtendedPublicKey.value)
  }

  // Offline

  public async getKeyPairFromSecret(secret: Secret, derivationPath?: string): Promise<KeyPair> {
    switch (secret.type) {
      case 'hex':
        return this.getKeyPairFromHexSecret(secret.value, derivationPath)
      case 'mnemonic':
        return this.getKeyPairFromMnemonic(secret.value, derivationPath, secret.password)
      default:
        assertNever(secret)
        throw new UnsupportedError(Domain.BITCOIN, 'Unsupported secret type.')
    }
  }

  private async getKeyPairFromHexSecret(secret: string, derivationPath?: string): Promise<KeyPair> {
    const node = this.bitcoinJS.lib.HDNode.fromSeedHex(secret, this.bitcoinJS.config.network)
    const derivedNode = derivationPath ? node.derivePath(derivationPath) : node

    return {
      secretKey: newSecretKey(derivedNode.keyPair.getPrivateKeyBuffer().toString('hex'), 'hex'),
      publicKey: newPublicKey(derivedNode.keyPair.getPublicKeyBuffer().toString('hex'), 'hex')
    }
  }

  private async getKeyPairFromMnemonic(mnemonic: string, derivationPath?: string, password?: string): Promise<KeyPair> {
    const secret: Buffer = mnemonicToSeed(mnemonic, password)

    return this.getKeyPairFromHexSecret(secret.toString('hex'), derivationPath)
  }

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
    const derivedNode = derivationPath ? node.derivePath(derivationPath) : undefined

    return {
      secretKey: newExtendedSecretKey(derivedNode.toBase58(), 'encoded'),
      publicKey: newExtendedPublicKey(derivedNode.neutered().toBase58(), 'encoded')
    }
  }

  private async getExtendedKeyPairFromMnemonic(mnemonic: string, derivationPath?: string, password?: string): Promise<ExtendedKeyPair> {
    const secret: Buffer = mnemonicToSeed(mnemonic, password)

    return this.getExtendedKeyPairFromHexSecret(secret.toString('hex'), derivationPath)
  }

  public async deriveFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<SecretKey> {
    const encodedExtendedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(extendedSecretKey, 'encoded')
    const childSecretKey: Buffer = this.bitcoinJS.lib.HDNode.fromBase58(encodedExtendedSecretKey.value, this.bitcoinJS.config.network)
      .derive(visibilityIndex)
      .derive(addressIndex)
      .getPrivateKeyBuffer()

    return newSecretKey(childSecretKey.toString('hex'), 'hex')
  }

  public async signTransactionWithSecretKey(
    transaction: BitcoinUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<BitcoinSignedTransaction> {
    switch (secretKey.type) {
      case 'priv':
        return this.signTransactionWithNonExtendedSecretKey(transaction, secretKey)
      case 'xpriv':
        return this.signTransactionWithExtendedSecretKey(transaction, secretKey)
      default:
        assertNever(secretKey)
        throw new UnsupportedError(Domain.BITCOIN, 'Secret key type not supported.')
    }
  }

  private async signTransactionWithNonExtendedSecretKey(
    transaction: BitcoinUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<BitcoinSignedTransaction> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')
    const transactionBuilder = new this.bitcoinJS.lib.TransactionBuilder(this.bitcoinJS.config.network)

    for (const input of transaction.ins) {
      transactionBuilder.addInput(input.txId, input.vout)
    }

    for (const output of transaction.outs) {
      if (output.isChange) {
        const bufferSecretKey: Buffer = Buffer.from(secretKey.value, 'hex')
        const keyPair = this.bitcoinJS.lib.ECPair(BigInteger.fromBuffer(bufferSecretKey), null, {
          network: this.bitcoinJS.config.network
        })
        const publicKey: PublicKey = newPublicKey(keyPair.getPublicKeyBuffer().toString('hex'), 'hex')
        const generatedChangeAddress: string = await this.getAddressFromPublicKey(publicKey)
        if (generatedChangeAddress !== output.recipient) {
          throw new ConditionViolationError(Domain.BITCOIN, 'Change address could not be verified.')
        }
      }

      transactionBuilder.addOutput(output.recipient, new BigNumber(output.value).toNumber())
    }

    for (let i = 0; i < transaction.ins.length; i++) {
      transactionBuilder.sign(i, Buffer.from(hexSecretKey.value, 'hex'))
    }

    return this.createSignedTransaction(transaction, transactionBuilder)
  }

  private async signTransactionWithExtendedSecretKey(
    transaction: BitcoinUnsignedTransaction,
    extendedSecretKey: ExtendedSecretKey
  ): Promise<BitcoinSignedTransaction> {
    const encodedExtendedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(extendedSecretKey, 'encoded')
    const transactionBuilder = new this.bitcoinJS.lib.TransactionBuilder(this.bitcoinJS.config.network)
    const node = this.bitcoinJS.lib.HDNode.fromBase58(encodedExtendedSecretKey.value, this.bitcoinJS.config.network)

    for (const input of transaction.ins) {
      transactionBuilder.addInput(input.txId, input.vout)
    }
    const changeAddressBatchSize: number = 10
    const changeAddressMaxAddresses: number = 500

    for (const output of transaction.outs) {
      let changeAddressIsValid: boolean = false
      if (output.isChange) {
        const extendedPublicKey: ExtendedPublicKey = newExtendedPublicKey(node.neutered().toBase58(), 'encoded')
        if (output.derivationPath) {
          const derivedPublicKey: PublicKey = await this.deriveFromExtendedPublicKey(
            extendedPublicKey,
            1,
            parseInt(output.derivationPath, 10)
          )
          const generatedChangeAddress: string = await this.getAddressFromPublicKey(derivedPublicKey)
          changeAddressIsValid = generatedChangeAddress === output.recipient
        } else {
          for (let x = 0; x < changeAddressMaxAddresses; x += changeAddressBatchSize) {
            const derivedPublicKeys: PublicKey[] = await Promise.all(
              Array.from(new Array(changeAddressBatchSize)).map(async () => {
                return this.deriveFromExtendedPublicKey(extendedPublicKey, 1, x)
              })
            )
            const addresses: string[] = await Promise.all(
              derivedPublicKeys.map((publicKey: PublicKey) => {
                return this.getAddressFromPublicKey(publicKey)
              })
            )
            if (addresses.indexOf(output.recipient) >= 0) {
              changeAddressIsValid = true
              x = changeAddressMaxAddresses
            }
          }
        }
        if (!changeAddressIsValid) {
          throw new InvalidValueError(Domain.BITCOIN, 'Change address could not be verified.')
        }
      }
      transactionBuilder.addOutput(output.recipient, new BigNumber(output.value).toNumber())
    }

    for (let i = 0; i < transaction.ins.length; i++) {
      transactionBuilder.sign(i, node.derivePath(transaction.ins[i].derivationPath))
    }

    return this.createSignedTransaction(transaction, transactionBuilder)
  }

  private createSignedTransaction(unsignedTransaction: BitcoinUnsignedTransaction, transactionBuilder: any): BitcoinSignedTransaction {
    let fee: BigNumber = new BigNumber(0)
    for (const txIn of unsignedTransaction.ins) {
      fee = fee.plus(new BigNumber(txIn.value))
    }
    for (const txOut of unsignedTransaction.outs) {
      fee = fee.minus(new BigNumber(txOut.value))
    }

    return newSignedTransaction<BitcoinSignedTransaction>({
      from: unsignedTransaction.ins.map((obj) => obj.address),
      to: unsignedTransaction.outs.filter((obj) => !obj.isChange).map((obj) => obj.recipient),
      amount: unsignedTransaction.outs
        .filter((obj) => !obj.isChange)
        .map((obj) => new BigNumber(obj.value))
        .reduce((accumulator, currentValue) => accumulator.plus(currentValue))
        .toString(10),
      fee: fee.toString(10),
      transaction: transactionBuilder.build().toHex()
    })
  }

  public async signMessageWithKeyPair(message: string, keyPair: ExtendedKeyPair | KeyPair): Promise<Signature> {
    const hexSecretKey: SecretKey | ExtendedSecretKey =
      keyPair.secretKey.type === 'priv' ? convertSecretKey(keyPair.secretKey, 'hex') : convertExtendedSecretKey(keyPair.secretKey, 'hex')

    const signature: string = await this.cryptoClient.signMessage(message, { privateKey: hexSecretKey.value })

    return newSignature(signature, 'encoded')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: ExtendedKeyPair | KeyPair): Promise<string> {
    let hexSecretKey: SecretKey
    if (keyPair.secretKey.type === 'priv') {
      hexSecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    } else {
      const encodedExtendedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(keyPair.secretKey, 'encoded')
      const node = this.bitcoinJS.lib.HDNode.fromBase58(encodedExtendedSecretKey.value, this.bitcoinJS.config.network)
      const derivedNode = node.derive(0).derive(0)
      hexSecretKey = newSecretKey(derivedNode.keyPair.getPrivateKeyBuffer(), 'hex')
    }

    return this.cryptoClient.decryptAsymmetric(payload, { publicKey: '', privateKey: hexSecretKey.value })
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.cryptoClient.encryptAES(payload, secretKey.value)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.cryptoClient.decryptAES(payload, secretKey.value)
  }

  // Online

  public async getNetwork(): Promise<BitcoinProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: ExtendedPublicKey | PublicKey,
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits>> {
    switch (publicKey.type) {
      case 'pub':
        return this.getTransactionsForNonExtendedPublicKey(publicKey, limit, cursor)
      case 'xpub':
        return this.getTransactionsForExtendedPublicKey(publicKey, limit, cursor)
      default:
        assertNever(publicKey)
        throw new UnsupportedError(Domain.BITCOIN, 'Public key type not supported')
    }
  }

  private async getTransactionsForNonExtendedPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddresses([address], limit, cursor)
  }

  private async getTransactionsForExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits>> {
    const encodedExtendedPublicKey: ExtendedPublicKey = this.convertExtendedPublicKey(extendedPublicKey, 'encoded')
    const page: number = cursor?.page ?? 1
    const url: string = `${this.options.network.indexerApi}/api/v2/xpub/${encodedExtendedPublicKey.value}?details=txs&tokens=used&pageSize=${limit}&page=${page}`
    const { data }: { data: XPubResponse } = await axios.get(url, {
      responseType: 'json'
    })

    const ourAddresses = (data.tokens || []).filter((token) => token.type === 'XPUBAddress').map((token) => token.name)

    const airGapTransactions: AirGapTransaction<BitcoinUnits>[] = []

    if (data.page === page) {
      for (const transaction of data.transactions || []) {
        const tempAirGapTransactionFrom: string[] = []
        const tempAirGapTransactionTo: string[] = []
        let tempAirGapTransactionIsInbound: boolean = true

        let amount = new BigNumber(0)

        for (const vin of transaction.vin) {
          if (containsSome(vin.addresses, ourAddresses)) {
            tempAirGapTransactionIsInbound = false
          }
          tempAirGapTransactionFrom.push(...vin.addresses)
          amount = amount.plus(vin.value)
        }

        for (const vout of transaction.vout) {
          if (vout.addresses) {
            tempAirGapTransactionTo.push(...vout.addresses)
            // If receiving address is our address, and transaction is outbound => our change
            if (containsSome(vout.addresses, ourAddresses) && !tempAirGapTransactionIsInbound) {
              // remove only if related to this address
              amount = amount.minus(vout.value)
            }
            // If receiving address is not ours, and transaction isbound => senders change
            if (!containsSome(vout.addresses, ourAddresses) && tempAirGapTransactionIsInbound) {
              amount = amount.minus(vout.value)
            }
          }
        }

        // deduct fee from amount
        amount = amount.minus(transaction.fees)

        const airGapTransaction: AirGapTransaction<BitcoinUnits> = {
          from: tempAirGapTransactionFrom,
          to: tempAirGapTransactionTo,
          isInbound: tempAirGapTransactionIsInbound,

          amount: newAmount(amount, 'blockchain'),
          fee: newAmount(transaction.fees, 'blockchain'),

          status: {
            type: 'applied',
            hash: transaction.txid,
            block: transaction.blockHeight.toString()
          },

          network: this.options.network,
          timestamp: transaction.blockTime
        }

        airGapTransactions.push(airGapTransaction)
      }
    }

    const hasNext: boolean = page < data.totalPages

    return {
      transactions: airGapTransactions,
      cursor: {
        hasNext,
        page: hasNext ? page + 1 : undefined
      }
    }
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits>> {
    return this.getTransactionsForAddresses([address], limit, cursor)
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits>> {
    const airGapTransactions: AirGapTransaction<BitcoinUnits>[] = []
    const page = cursor?.page ?? 1
    const url = `${this.options.network.indexerApi}/api/v2/address/${addresses[0]}?page=${page}&pageSize=${limit}&details=txs`
    const { data } = await axios.get<AddressResponse>(url, {
      responseType: 'json'
    })

    if (data.page == page) {
      for (const transaction of data.transactions || []) {
        const tempAirGapTransactionFrom: string[] = []
        const tempAirGapTransactionTo: string[] = []
        let tempAirGapTransactionIsInbound: boolean = true

        let amount = new BigNumber(0)

        for (const vin of transaction.vin) {
          if (vin.addresses && containsSome(vin.addresses, addresses)) {
            tempAirGapTransactionIsInbound = false
          }
          tempAirGapTransactionFrom.push(...vin.addresses)
          amount = vin.value ? amount.plus(vin.value) : amount
        }

        for (const vout of transaction.vout) {
          if (vout.addresses) {
            tempAirGapTransactionTo.push(...vout.addresses)
            // If receiving address is our address, and transaction is outbound => our change
            if (containsSome(vout.addresses, addresses) && !tempAirGapTransactionIsInbound) {
              // remove only if related to this address
              amount = amount.minus(new BigNumber(vout.value))
            }
            // If receiving address is not ours, and transaction isbound => senders change
            if (!containsSome(vout.addresses, addresses) && tempAirGapTransactionIsInbound) {
              amount = amount.minus(new BigNumber(vout.value))
            }
          }
        }

        // deduct fee from amount
        amount = amount.minus(new BigNumber(transaction.fees))

        const airGapTransaction: AirGapTransaction<BitcoinUnits> = {
          from: tempAirGapTransactionFrom,
          to: tempAirGapTransactionTo,
          isInbound: tempAirGapTransactionIsInbound,

          amount: newAmount(amount, 'blockchain'),
          fee: newAmount(transaction.fees, 'blockchain'),

          status: {
            type: 'applied',
            hash: transaction.txid,
            block: transaction.blockHeight.toString()
          },

          network: this.options.network,
          timestamp: transaction.blockTime
        }

        airGapTransactions.push(airGapTransaction)
      }
    }

    const hasNext: boolean = page < data.totalPages

    return {
      transactions: airGapTransactions,
      cursor: {
        hasNext,
        page: hasNext ? page + 1 : undefined
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: ExtendedPublicKey | PublicKey): Promise<Balance<BitcoinUnits>> {
    switch (publicKey.type) {
      case 'pub':
        return this.getBalanceOfNonExtendedPublicKey(publicKey)
      case 'xpub':
        return this.getBalanceOfExtendedPublicKey(publicKey)
      default:
        assertNever(publicKey)
        throw new UnsupportedError(Domain.BITCOIN, 'Unsupported public key type.')
    }
  }

  private async getBalanceOfNonExtendedPublicKey(publicKey: PublicKey): Promise<Balance<BitcoinUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address])
  }

  private async getBalanceOfExtendedPublicKey(extendedPublicKey: ExtendedPublicKey): Promise<Balance<BitcoinUnits>> {
    const encodedExtendedPublicKey: ExtendedPublicKey = this.convertExtendedPublicKey(extendedPublicKey, 'encoded')
    const { data }: { data: XPubResponse } = await axios.get(
      `${this.options.network.indexerApi}/api/v2/xpub/${encodedExtendedPublicKey.value}?pageSize=1`,
      {
        responseType: 'json'
      }
    )

    return {
      total: newAmount(data.balance, 'blockchain')
    }
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<BitcoinUnits>> {
    return this.getBalanceOfAddresses([address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<BitcoinUnits>> {
    let valueAccumulator: BigNumber = new BigNumber(0)

    // The API doesn't support batch checking of balances, so we have to do it manually
    for (const address of addresses) {
      const { data } = await axios.get(`${this.options.network.indexerApi}/api/v2/address/${address}?details=basic`, {
        responseType: 'json'
      })

      valueAccumulator = valueAccumulator.plus(new BigNumber(data.balance))
    }

    return {
      total: newAmount(valueAccumulator, 'blockchain')
    }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: ExtendedPublicKey | PublicKey,
    to: string[],
    configuration?: TransactionConfiguration<BitcoinUnits>
  ): Promise<Amount<BitcoinUnits>> {
    return (await this.getBalanceOfPublicKey(publicKey)).total
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: ExtendedPublicKey | PublicKey,
    details: TransactionDetails<BitcoinUnits>[]
  ): Promise<FeeDefaults<BitcoinUnits>> {
    const result = (await axios.get(`${this.options.network.indexerApi}/api/v2/estimatefee/5`)).data.result
    const estimatedFee: BigNumber = new BigNumber(newAmount<BitcoinUnits>(result, 'BTC').blockchain(this.units).value)
    if (estimatedFee.isZero()) {
      return this.feeDefaults
    }
    const feeStepFactor: BigNumber = new BigNumber(0.5)
    const mediumFee: BigNumber = estimatedFee
    const lowFee: BigNumber = mediumFee.minus(mediumFee.times(feeStepFactor)).integerValue(BigNumber.ROUND_FLOOR)
    const highFee: BigNumber = mediumFee.plus(mediumFee.times(feeStepFactor)).integerValue(BigNumber.ROUND_FLOOR)

    return {
      low: newAmount(lowFee, 'blockchain'),
      medium: newAmount(mediumFee, 'blockchain'),
      high: newAmount(highFee, 'blockchain')
    }
  }

  public async prepareTransactionWithPublicKey(
    publicKey: ExtendedPublicKey | PublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: TransactionConfiguration<BitcoinUnits>
  ): Promise<BitcoinUnsignedTransaction> {
    switch (publicKey.type) {
      case 'pub':
        return this.prepareTransactionWithNonExtendedPublicKey(publicKey, details, configuration)
      case 'xpub':
        return this.prepareTransactionWithExtendedPublicKey(publicKey, details, configuration)
      default:
        assertNever(publicKey)
        throw new UnsupportedError(Domain.BITCOIN, 'Unuspported public key type.')
    }
  }

  private async prepareTransactionWithNonExtendedPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: TransactionConfiguration<BitcoinUnits>
  ): Promise<BitcoinUnsignedTransaction> {
    let fee: Amount<BitcoinUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<BitcoinUnits> = await this.getTransactionFeeWithPublicKey(publicKey, details)
      fee = estimatedFee.medium
    }

    const wrappedFee: BigNumber = new BigNumber(newAmount(fee).blockchain(this.units).value)

    const transaction: BitcoinUnsignedTransaction = newUnsignedTransaction({
      ins: [],
      outs: []
    })

    const address = await this.getAddressFromPublicKey(publicKey)

    const { data: utxos } = await axios.get<UTXOResponse[]>(`${this.options.network.indexerApi}/api/v2/utxo/${address}`, {
      responseType: 'json'
    })
    const totalRequiredBalance: BigNumber = details
      .map(({ amount }) => new BigNumber(newAmount(amount).blockchain(this.units).value))
      .reduce((accumulator: BigNumber, currentValue: BigNumber) => accumulator.plus(currentValue))
      .plus(wrappedFee)

    let valueAccumulator: BigNumber = new BigNumber(0)
    for (const utxo of utxos) {
      valueAccumulator = valueAccumulator.plus(new BigNumber(utxo.value))
      transaction.ins.push({
        txId: utxo.txid,
        value: new BigNumber(utxo.value).toString(10),
        vout: utxo.vout,
        address
      })

      if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
        break
      }
    }

    if (valueAccumulator.isLessThan(totalRequiredBalance)) {
      throw new BalanceError(
        Domain.BITCOIN,
        `not enough balance, having ${valueAccumulator.toFixed()} of ${totalRequiredBalance.toFixed()}`
      )
    }

    // tx.addInput(utxo.txid, utxo.vout)
    for (let i: number = 0; i < details.length; i++) {
      const value: string = newAmount(details[i].amount).blockchain(this.units).value
      transaction.outs.push({
        recipient: details[i].to,
        isChange: false,
        value
      })
      valueAccumulator = valueAccumulator.minus(value)
      // tx.addOutput(details[i].to, details[i].amount)
    }

    // If the change is considered dust, the transaction will fail.
    // Dust is a variable value around 300-600 satoshis, depending on the configuration.
    // We set a low fee here to not block any transactions, but it might still fail due to "dust".
    const changeValue: BigNumber = valueAccumulator.minus(wrappedFee)
    if (changeValue.isGreaterThan(new BigNumber(DUST_AMOUNT))) {
      transaction.outs.push({
        recipient: address,
        isChange: true,
        value: changeValue.toString(10)
      })
    }

    return transaction
  }

  private async prepareTransactionWithExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: TransactionConfiguration<BitcoinUnits>
  ): Promise<BitcoinUnsignedTransaction> {
    let targetFee: Amount<BitcoinUnits>
    if (configuration?.fee !== undefined) {
      targetFee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<BitcoinUnits> = await this.getTransactionFeeWithPublicKey(extendedPublicKey, details)
      targetFee = estimatedFee.medium
    }

    const wrappedFee: BigNumber = new BigNumber(newAmount(targetFee).blockchain(this.units).value)

    const transaction: BitcoinUnsignedTransaction = newUnsignedTransaction({
      ins: [],
      outs: []
    })

    const { data: utxos }: { data: UTXOResponse[] } = await axios
      .get<UTXOResponse[]>(`${this.options.network.indexerApi}/api/v2/utxo/${extendedPublicKey.value}?confirmed=true`, {
        responseType: 'json'
      })
      .catch((error) => {
        throw new NetworkError(Domain.BITCOIN, error as AxiosError)
      })

    if (utxos.length <= 0) {
      throw new BalanceError(Domain.BITCOIN, 'not enough balance') // no transactions found on those addresses, probably won't find anything in the next ones
    }

    const totalRequiredBalance: BigNumber = details
      .map(({ amount }) => new BigNumber(newAmount(amount).blockchain(this.units).value))
      .reduce((accumulator: BigNumber, currentValue: BigNumber) => accumulator.plus(currentValue))
      .plus(wrappedFee)
    let valueAccumulator: BigNumber = new BigNumber(0)

    const getPathIndexes = (path: string): [number, number] => {
      const result = path
        .split('/')
        .slice(-2)
        .map((item) => parseInt(item, 10))
        .filter((item) => !isNaN(item))

      if (result.length !== 2) {
        throw new ConditionViolationError(Domain.BITCOIN, 'Unexpected path format')
      }

      return [result[0], result[1]]
    }

    for (const utxo of utxos) {
      valueAccumulator = valueAccumulator.plus(utxo.value)
      const indexes: [number, number] = getPathIndexes(utxo.path)

      const derivedPublicKey: PublicKey = await this.deriveFromExtendedPublicKey(extendedPublicKey, indexes[0], indexes[1])
      const derivedAddress: string = await this.getAddressFromPublicKey(derivedPublicKey)
      if (derivedAddress === utxo.address) {
        transaction.ins.push({
          txId: utxo.txid,
          value: new BigNumber(utxo.value).toString(10),
          vout: utxo.vout,
          address: utxo.address,
          derivationPath: indexes.join('/')
        })
      } else {
        throw new InvalidValueError(Domain.BITCOIN, `Invalid address ${JSON.stringify(utxo.address)} returned from API`)
      }

      if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
        break
      }
    }

    if (valueAccumulator.isLessThan(totalRequiredBalance)) {
      throw new BalanceError(Domain.BITCOIN, 'not enough balance')
    }

    for (let i = 0; i < details.length; i++) {
      const value: string = newAmount(details[i].amount).blockchain(this.units).value

      transaction.outs.push({
        recipient: details[i].to,
        isChange: false,
        value,
        derivationPath: '' // TODO: Remove this as soon as our serializer supports optional properties
      })
      valueAccumulator = valueAccumulator.minus(value)
    }

    const lastUsedInternalAddress: number = Math.max(
      -1,
      ...utxos
        .map((utxo: UTXOResponse) => getPathIndexes(utxo.path))
        .filter((indexes: [number, number]) => indexes[0] === 1)
        .map((indexes: [number, number]) => indexes[1])
    )

    // If the change is considered dust, the transaction will fail.
    // Dust is a variable value around 300-600 satoshis, depending on the configuration.
    // We set a low fee here to not block any transactions, but it might still fail due to "dust".
    const changeValue: BigNumber = valueAccumulator.minus(wrappedFee)
    if (changeValue.isGreaterThan(new BigNumber(DUST_AMOUNT))) {
      const changeAddressIndex: number = lastUsedInternalAddress + 1
      const derivedPublicKey: PublicKey = await this.deriveFromExtendedPublicKey(extendedPublicKey, 1, changeAddressIndex)
      const derivedAddress: string = await this.getAddressFromPublicKey(derivedPublicKey)
      transaction.outs.push({
        recipient: derivedAddress,
        isChange: true,
        value: changeValue.toString(10),
        derivationPath: changeAddressIndex.toString()
      })
    }

    return transaction
  }

  public async broadcastTransaction(transaction: BitcoinSignedTransaction): Promise<string> {
    const { data } = await axios.post(`${this.options.network.indexerApi}/api/v2/sendtx/`, transaction.transaction)

    return data.result
  }

  // Custom

  protected convertExtendedPublicKey(extendedPublicKey: ExtendedPublicKey, targetFormat: ExtendedPublicKey['format']): ExtendedPublicKey {
    return convertExtendedPublicKey<BitcoinExtendedPublicKeyEncoding>(extendedPublicKey, {
      format: targetFormat,
      type: 'xpub'
    })
  }
}

// Factory

export function createBitcoinProtocol(options: RecursivePartial<BitcoinProtocolOptions> = {}): BitcoinProtocol {
  return new BitcoinProtocolImpl(options)
}

export const BITCOIN_MAINNET_PROTOCOL_NETWORK: BitcoinStandardProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: '',
  indexerApi: 'https://bitcoin.prod.gke.papers.tech'
}

const DEFAULT_BITCOIN_PROTOCOL_NETWORK: BitcoinStandardProtocolNetwork = BITCOIN_MAINNET_PROTOCOL_NETWORK

export function createBitcoinProtocolOptions(network: Partial<BitcoinProtocolNetwork> = {}): BitcoinProtocolOptions {
  return {
    network:
      network.type === 'custom'
        ? { ...DEFAULT_BITCOIN_PROTOCOL_NETWORK, bitcoinjsNetworkName: 'bitcoin', ...network }
        : ({ ...DEFAULT_BITCOIN_PROTOCOL_NETWORK, ...network } as BitcoinStandardProtocolNetwork)
  }
}
