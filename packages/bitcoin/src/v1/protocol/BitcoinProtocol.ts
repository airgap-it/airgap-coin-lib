import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios, { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.33.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import * as bitcoinMessage from '@airgap/coinlib-core/dependencies/src/bitcoinjs-message-2.1.1/index'
import * as ecc from '@airgap/coinlib-core/dependencies/src/@bitcoinerlab/secp256k1-1.2.0/src/index'
import * as bitcoinJSLib from '@airgap/coinlib-core/dependencies/src/bitcoinjs-lib-6.1.7/src/index'
import { BIP32Factory, BIP32Interface } from '@airgap/coinlib-core/dependencies/src/bip32-5.0.1/src/index'
import { BalanceError, ConditionViolationError, InvalidValueError, NetworkError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { encodeDerivative } from '@airgap/crypto'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
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
  SecretKey,
  Signature,
  SignedTransaction,
  TransactionFullConfiguration,
  TransactionDetails,
  UnsignedTransaction,
  TransactionSimpleConfiguration,
  AirGapUIAlert
} from '@airgap/module-kit'

import { BitcoinAddress } from '../data/BitcoinAddress'
import { buildAndSignLegacyTransaction, ecPairSigner } from '../utils/legacy-signing'
import { BitcoinJS } from '../types/bitcoinjs'
import { BitcoinCryptoConfiguration } from '../types/crypto'
import { AddressResponse, UTXOResponse, XPubResponse } from '../types/indexer'
import { BitcoinProtocolNetwork, BitcoinProtocolOptions, BitcoinStandardProtocolNetwork, BitcoinUnits } from '../types/protocol'
import { BitcoinSignedTransaction, BitcoinTransactionCursor, BitcoinUnsignedTransaction } from '../types/transaction'
import { containsSome } from '../utils/common'
import {
  convertExtendedPublicKey,
  convertExtendedSecretKey,
  convertPublicKey,
  convertSecretKey,
  ExtendedPublicKeyEncoding,
  ExtendedSecretKeyEncoding
} from '../utils/key'
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
    CryptoConfiguration: BitcoinCryptoConfiguration
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
> {
  _isBitcoinProtocol: true
}

// Implementation

const DUST_AMOUNT: number = 50

export interface BitcoinKeyConfiguration {
  xpriv: {
    type: ExtendedSecretKeyEncoding
  }
  xpub: {
    type: ExtendedPublicKeyEncoding
  }
}

// Constructed once at module load: BIP32Factory runs a full elliptic-curve self-test (testEcc)
// on every construction, which is far too expensive to repeat per protocol instance.
const defaultBip32 = BIP32Factory(ecc as any)

export class BitcoinProtocolImpl implements BitcoinProtocol {
  public readonly _isBitcoinProtocol: true = true

  private readonly options: BitcoinProtocolOptions
  private readonly keyConfiguration: BitcoinKeyConfiguration
  private readonly cryptoClient: BitcoinCryptoClient
  public readonly bitcoinJS: BitcoinJS
  private readonly bip32Lib: { fromBase58(key: string, network?: any): BIP32Interface }

  constructor(
    options: RecursivePartial<BitcoinProtocolOptions> = {},
    keyConfiguration?: BitcoinKeyConfiguration,
    bitcoinJS: any = bitcoinJSLib,
    bitcoinJSMessage: any = bitcoinMessage,
    // Hash used when base58check-encoding extended keys. Defaults to the library's SHA256d; the
    // previous implementation read this off the vendored fork's non-standard
    // `network.hashFunctions`, which neither bitcoinjs-lib nor groestlcoinjs-lib provides.
    addressHashFunction: (input: Buffer) => Buffer = bitcoinJS.crypto.hash256,
    // BIP32 implementation. Groestlcoin needs its own (`bip32grs`) because extended keys are
    // base58check-encoded with groestl, which the standard `bip32` cannot decode.
    bip32Lib: { fromBase58(key: string, network?: any): BIP32Interface } = defaultBip32
  ) {
    this.bip32Lib = bip32Lib
    this.options = createBitcoinProtocolOptions(options.network)
    this.bitcoinJS = {
      lib: bitcoinJS,
      message: bitcoinJSMessage,
      config: {
        network: getBitcoinJSNetwork(this.options.network, bitcoinJS),
        addressHashFunction
      }
    }

    this.cryptoClient = new BitcoinCryptoClient(this, this.bitcoinJS)
    this.keyConfiguration = keyConfiguration ?? {
      xpriv: {
        type: 'xprv'
      },
      xpub: {
        type: 'xpub'
      }
    }
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

    return BitcoinAddress.fromPublicKey(
      Buffer.from(hexPublicKey.value, 'hex'),
      this.bitcoinJS.lib,
      this.bitcoinJS.config.network
    ).asString()
  }

  private async getAddressFromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey): Promise<string> {
    const encodedExtendedPublicKey: ExtendedPublicKey = this.convertExtendedPublicKey(extendedPublicKey, 'encoded')
    const node = this.bip32Node(encodedExtendedPublicKey.value)

    return BitcoinAddress.fromPublicKey(node.publicKey, this.bitcoinJS.lib, this.bitcoinJS.config.network).asString()
  }

  public async deriveFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    const encodedExtendedPublicKey: ExtendedPublicKey = this.convertExtendedPublicKey(extendedPublicKey, 'encoded')
    const childPublicKey: Buffer = Buffer.from(
      this.bip32Node(encodedExtendedPublicKey.value).derive(visibilityIndex).derive(addressIndex).publicKey
    )

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
        return this.getDetailsFromUnsignedTransaction(transaction, _publicKey)
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
      // if (new BigNumber(output.value).isEqualTo(transaction.amount)) {
      tx.to.push(address)
      // }
    })

    return [tx]
  }

  private async getDetailsFromUnsignedTransaction(
    transaction: BitcoinUnsignedTransaction,
    publickey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<BitcoinUnits>[]> {
    let fee: BigNumber = new BigNumber(0)

    for (const txIn of transaction.ins) {
      fee = fee.plus(new BigNumber(txIn.value))
    }

    for (const txOut of transaction.outs) {
      fee = fee.minus(new BigNumber(txOut.value))
    }

    const uiAlerts: AirGapUIAlert[] = []

    const changeAddressDatas = await Promise.all(
      transaction.outs.map(async (obj) => {
        let isChangeAddress = obj.isChange ? obj.isChange : false
        let isOwned = false
        let addressIndex = 0

        const address = obj.recipient
        const amount = obj.value
        let ourGeneratedAddress: string

        if (isChangeAddress) {
          const splitPath = obj.derivationPath!.split('/')

          addressIndex = +splitPath[splitPath.length - 1]

          if (publickey.type === 'xpub') {
            const ourPublickey = await this.deriveFromExtendedPublicKey(publickey, 1, addressIndex)
            ourGeneratedAddress = await this.getAddressFromPublicKey(ourPublickey)
          } else {
            ourGeneratedAddress = await this.getAddressFromNonExtendedPublicKey(publickey)
          }

          if (ourGeneratedAddress === address) {
            isOwned = true
          } else {
            for (let x = 0; x < 1000; x++) {
              const ourPublickey = await this.deriveFromExtendedPublicKey(publickey as ExtendedPublicKey, 1, x)
              ourGeneratedAddress = await this.getAddressFromPublicKey(ourPublickey)

              if (ourGeneratedAddress === address) {
                isOwned = true
                addressIndex = x
                break
              }
            }
          }
        }

        if (isChangeAddress && isOwned) {
          uiAlerts.push({
            type: 'success',
            title: {
              type: 'plain',
              value: ''
            },
            description: {
              type: 'plain',
              value: 'Note: your change address has been verified'
            },
            icon: undefined,
            actions: undefined
          })
        } else if (isChangeAddress && !isOwned) {
          uiAlerts.push({
            type: 'warning',
            title: {
              type: 'plain',
              value: ''
            },
            description: {
              type: 'plain',
              value: 'Note: your change address has not been verified'
            },
            icon: undefined,
            actions: undefined
          })
        }

        return [
          address as string,
          {
            isChangeAddress: isChangeAddress,
            isOwned: isOwned,
            path: addressIndex === 0 ? '' : `m/84'/0'/0'/1/${addressIndex}`,
            amount
          }
        ]
      })
    )

    const changeAddressInfo = {}

    changeAddressDatas.forEach((changeAddressData) => {
      changeAddressInfo[changeAddressData[0] as string] = changeAddressData[1]
    })

    return [
      {
        from: transaction.ins.map((obj) => obj.address),
        to: transaction.outs.map((obj) => obj.recipient),
        isInbound: false,

        amount: newAmount(
          transaction.outs.map((obj) => new BigNumber(obj.value)).reduce((accumulator, currentValue) => accumulator.plus(currentValue)),
          'blockchain'
        ),
        fee: newAmount(fee, 'blockchain'),

        network: this.options.network,
        changeAddressInfo,
        uiAlerts
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

  private readonly cryptoConfiguration: BitcoinCryptoConfiguration = {
    algorithm: 'secp256k1'
  }

  public async getCryptoConfiguration(): Promise<BitcoinCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    const node = this.derivativeToBip32Node(derivative)

    return {
      secretKey: newSecretKey(Buffer.from(node.privateKey!).toString('hex'), 'hex'),
      publicKey: newPublicKey(Buffer.from(node.publicKey).toString('hex'), 'hex')
    }
  }

  public async getExtendedKeyPairFromDerivative(derivative: CryptoDerivative): Promise<ExtendedKeyPair> {
    const node = this.derivativeToBip32Node(derivative)

    return {
      secretKey: newExtendedSecretKey(node.toBase58(), 'encoded'),
      publicKey: newExtendedPublicKey(node.neutered().toBase58(), 'encoded')
    }
  }

  public async deriveFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<SecretKey> {
    const encodedExtendedSecretKey: ExtendedSecretKey = this.convertExtendedSecretKey(extendedSecretKey, 'encoded')
    const childSecretKey: Buffer = Buffer.from(
      this.bip32Node(encodedExtendedSecretKey.value).derive(visibilityIndex).derive(addressIndex).privateKey!
    )

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
    const signer = ecPairSigner(Buffer.from(hexSecretKey.value, 'hex'), this.bitcoinJS.config.network)

    for (const output of transaction.outs) {
      if (output.isChange) {
        const publicKey: PublicKey = newPublicKey(Buffer.from(signer.publicKey).toString('hex'), 'hex')
        const generatedChangeAddress: string = await this.getAddressFromPublicKey(publicKey)
        if (generatedChangeAddress !== output.recipient) {
          throw new ConditionViolationError(Domain.BITCOIN, 'Change address could not be verified.')
        }
      }
    }

    const hex: string = buildAndSignLegacyTransaction(
      this.bitcoinJS.lib,
      this.bitcoinJS.config.network,
      transaction.ins,
      transaction.outs,
      () => signer
    )

    return this.createSignedTransaction(transaction, hex)
  }

  private async signTransactionWithExtendedSecretKey(
    transaction: BitcoinUnsignedTransaction,
    extendedSecretKey: ExtendedSecretKey
  ): Promise<BitcoinSignedTransaction> {
    const encodedExtendedSecretKey: ExtendedSecretKey = this.convertExtendedSecretKey(extendedSecretKey, 'encoded')
    const node = this.bip32Node(encodedExtendedSecretKey.value)

    transaction.ins.forEach((input, index) => {
      if (input.derivationPath === undefined) {
        throw new ConditionViolationError(Domain.BITCOIN, `Transaction input ${index} is missing its derivation path.`)
      }
    })

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
              Array.from(new Array(changeAddressBatchSize), (_, offset: number) => {
                return this.deriveFromExtendedPublicKey(extendedPublicKey, 1, x + offset)
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
    }

    const hex: string = buildAndSignLegacyTransaction(
      this.bitcoinJS.lib,
      this.bitcoinJS.config.network,
      transaction.ins,
      transaction.outs,
      (index: number) => node.derivePath(transaction.ins[index].derivationPath!)
    )

    return this.createSignedTransaction(transaction, hex)
  }

  private createSignedTransaction(unsignedTransaction: BitcoinUnsignedTransaction, transactionHex: string): BitcoinSignedTransaction {
    let fee: BigNumber = new BigNumber(0)
    for (const txIn of unsignedTransaction.ins) {
      fee = fee.plus(new BigNumber(txIn.value))
    }
    for (const txOut of unsignedTransaction.outs) {
      fee = fee.minus(new BigNumber(txOut.value))
    }

    return newSignedTransaction<BitcoinSignedTransaction>({
      from: unsignedTransaction.ins.map((obj) => obj.address),
      to: unsignedTransaction.outs.map((obj) => obj.recipient),
      amount: unsignedTransaction.outs
        .map((obj) => new BigNumber(obj.value))
        .reduce((accumulator, currentValue) => accumulator.plus(currentValue))
        .toString(10),
      fee: fee.toString(10),
      transaction: transactionHex
    })
  }

  public async signMessageWithKeyPair(message: string, keyPair: ExtendedKeyPair | KeyPair): Promise<Signature> {
    const hexSecretKey: SecretKey | ExtendedSecretKey =
      keyPair.secretKey.type === 'priv'
        ? convertSecretKey(keyPair.secretKey, 'hex')
        : convertExtendedSecretKey(keyPair.secretKey, { format: 'hex' })

    const signature: string = await this.cryptoClient.signMessage(message, { privateKey: hexSecretKey.value })

    return newSignature(signature, 'encoded')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: ExtendedKeyPair | KeyPair): Promise<string> {
    let hexSecretKey: SecretKey | undefined = undefined
    if (keyPair.secretKey.type === 'priv') {
      hexSecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    } else {
      const encodedExtendedSecretKey: ExtendedSecretKey = this.convertExtendedSecretKey(keyPair.secretKey, 'encoded')
      const derivedNode = this.bip32Node(encodedExtendedSecretKey.value).derive(0).derive(0)
      hexSecretKey = newSecretKey(Buffer.from(derivedNode.privateKey!).toString('hex'), 'hex')
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
        let amountNotAdded = true
        let amount = new BigNumber(0)

        for (const vin of transaction.vin) {
          if (containsSome(vin.addresses, ourAddresses)) {
            tempAirGapTransactionIsInbound = false
          }
          tempAirGapTransactionFrom.push(...vin.addresses)
          // amount = amount.plus(vin.value)
        }

        for (const vout of transaction.vout) {
          if (vout.addresses) {
            tempAirGapTransactionTo.push(...vout.addresses)
            // If receiving address is our address, and transaction is outbound => our change
            // if (containsSome(vout.addresses, ourAddresses) && !tempAirGapTransactionIsInbound) {
            // remove only if related to this address
            // amount = amount.minus(vout.value)
            // }
            // If receiving address is not ours, and transaction isbound => senders change
            // if (!containsSome(vout.addresses, ourAddresses) && tempAirGapTransactionIsInbound) {
            // amount = amount.minus(vout.value)
            // }
          }

          if (containsSome(vout.addresses, ourAddresses) && transaction.vout.length > 2) {
            amount = amount.plus(vout.value)
            amountNotAdded = false
          }
        }

        // deduct fee from amount
        //amount = amount.minus(transaction.fees)

        if (amountNotAdded) {
          amount = amount.plus(transaction.vout[0].value)
        }

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
    configuration?: TransactionFullConfiguration<BitcoinUnits>
  ): Promise<Amount<BitcoinUnits>> {
    return (await this.getBalanceOfPublicKey(publicKey)).total
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: ExtendedPublicKey | PublicKey,
    _details: TransactionDetails<BitcoinUnits>[],
    _configuration?: TransactionSimpleConfiguration
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
    configuration?: TransactionFullConfiguration<BitcoinUnits>
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
    configuration?: TransactionFullConfiguration<BitcoinUnits>
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
    configuration?: TransactionFullConfiguration<BitcoinUnits>
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

  private convertExtendedSecretKey(extendedSecretKey: ExtendedSecretKey, targetFormat: ExtendedSecretKey['format']): ExtendedSecretKey {
    return convertExtendedSecretKey(extendedSecretKey, {
      format: targetFormat,
      type: this.keyConfiguration.xpriv.type,
      hashFunction: this.bitcoinJS.config.addressHashFunction
    })
  }

  private convertExtendedPublicKey(extendedPublicKey: ExtendedPublicKey, targetFormat: ExtendedPublicKey['format']): ExtendedPublicKey {
    return convertExtendedPublicKey(extendedPublicKey, {
      format: targetFormat,
      type: this.keyConfiguration.xpub.type,
      hashFunction: this.bitcoinJS.config.addressHashFunction
    })
  }

  private convertCryptoDerivative(derivative: CryptoDerivative): ExtendedSecretKey {
    const hexNode = encodeDerivative('hex', {
      ...derivative,
      secretKey: `00${derivative.secretKey}`
    })

    const extendedSecretKey: ExtendedSecretKey = {
      type: 'xpriv',
      format: 'hex',
      value: hexNode.secretKey
    }

    return this.convertExtendedSecretKey(extendedSecretKey, 'encoded')
  }

  /** Parses an extended key into a bip32 node on the configured network. */
  private bip32Node(extendedKey: string): BIP32Interface {
    return this.bip32Lib.fromBase58(extendedKey, this.bitcoinJS.config.network)
  }

  private derivativeToBip32Node(derivative: CryptoDerivative) {
    const extendedSecretKey: ExtendedSecretKey = this.convertCryptoDerivative(derivative)

    return this.bip32Node(extendedSecretKey.value)
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
  blockExplorerUrl: 'https://live.blockcypher.com/btc',
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
