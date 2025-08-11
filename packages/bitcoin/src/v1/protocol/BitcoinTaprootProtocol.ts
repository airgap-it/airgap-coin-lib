import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { BalanceError, ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import {
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  AirGapUIAlert,
  Amount,
  Balance,
  CryptoDerivative,
  ExtendedKeyPair,
  ExtendedPublicKey,
  ExtendedSecretKey,
  FeeDefaults,
  KeyPair,
  newAmount,
  newPublicKey,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  Signature,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration,
  Address,
  UnsignedTransaction,
  newExtendedSecretKey,
  newExtendedPublicKey
} from '@airgap/module-kit'
import * as bitcoin from 'bitcoinjs-lib'

import { BitcoinTaprootAddress } from '../data/BitcoinTaprootAddress'
import { BitcoinTaprootJS } from '../types/bitcoinjs'
import { BitcoinCryptoConfiguration } from '../types/crypto'
import { AddressResponse, UTXOResponse, XPubResponse } from '../types/indexer'
import { BitcoinProtocolNetwork, BitcoinProtocolOptions, BitcoinUnits } from '../types/protocol'
import {
  BitcoinTaprootSignedTransaction,
  BitcoinTaprootUnsignedTransaction,
  BitcoinTransactionCursor,
  BitcoinUnsignedTransaction,
  TaprootTransactionFullConfiguration
} from '../types/transaction'
import { containsSome, eachRecursive } from '../utils/common'
import { convertExtendedPublicKey, convertExtendedSecretKey, convertPublicKey } from '../utils/key'
import { getBitcoinJSNetwork } from '../utils/network'

import { BitcoinProtocol, createBitcoinProtocolOptions } from './BitcoinProtocol'
import { BIP32Factory, BIP32Interface } from 'bip32'
import { BitcoinSegwitProtocolImpl } from './BitcoinSegwitProtocol'
import { encodeDerivative } from '@airgap/crypto'
import ecc from '@bitcoinerlab/secp256k1'

// Interface

export interface BitcoinTaprootProtocol extends BitcoinProtocol<BitcoinTaprootSignedTransaction, BitcoinTaprootUnsignedTransaction> {
  _isBitcoinTaprootProtocol: true

  prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration: TaprootTransactionFullConfiguration<BitcoinUnits>
  ): Promise<BitcoinTaprootUnsignedTransaction>
}

// Implementation

const DUST_AMOUNT: number = 50

export class BitcoinTaprootProtocolImpl implements BitcoinTaprootProtocol {
  public readonly _isBitcoinProtocol: true = true
  public readonly _isBitcoinTaprootProtocol: true = true

  private readonly segwit: BitcoinSegwitProtocolImpl

  private readonly options: BitcoinProtocolOptions
  private readonly bitcoinJS: BitcoinTaprootJS
  private readonly bip32 = BIP32Factory(ecc)

  public constructor(options: RecursivePartial<BitcoinProtocolOptions> = {}, bitcoinJS: typeof bitcoin = bitcoin) {
    this.options = createBitcoinProtocolOptions(options.network)

    this.bitcoinJS = {
      lib: bitcoinJS,
      config: {
        network: getBitcoinJSNetwork(this.options.network, bitcoinJS)
      }
    }

    this.bitcoinJS.lib.initEccLib(ecc)

    this.segwit = new BitcoinSegwitProtocolImpl(options)

    this.metadata = {
      ...this.segwit.legacy.metadata,
      identifier: MainProtocolSymbols.BTC_TAPROOT,
      name: 'Bitcoin (Taproot)',
      account: {
        ...(this.segwit.legacy.metadata.account ?? {}),
        standardDerivationPath: `m/86'/0'/0'`,
        address: {
          ...(this.segwit.legacy.metadata.account?.address ?? {}),
          regex: '^(?:[13]{1}[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$'
        }
      }
    }
  }

  private readonly metadata: ProtocolMetadata<BitcoinUnits>

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration: TaprootTransactionFullConfiguration<BitcoinUnits>
  ): Promise<BitcoinTaprootUnsignedTransaction> {
    switch (publicKey.type) {
      case 'pub':
        return this.prepareTransactionWithNonExtendedPublicKey(publicKey, details, configuration)
      case 'xpub':
        return this.prepareTransactionWithExtendedPublicKey(publicKey, details, configuration)
      default:
        assertNever(publicKey)
        throw new UnsupportedError(Domain.BITCOIN, 'Unsupported public key type.')
    }
  }

  public async prepareTransactionWithNonExtendedPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration: TaprootTransactionFullConfiguration<BitcoinUnits>
  ): Promise<BitcoinTaprootUnsignedTransaction> {
    throw new Error('Method not implemented.')
  }

  public async getCryptoConfiguration(): Promise<BitcoinCryptoConfiguration> {
    return this.segwit.getCryptoConfiguration()
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return this.segwit.getKeyPairFromDerivative(derivative)
  }

  public async signTransactionWithSecretKey(
    transaction: BitcoinTaprootUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<BitcoinTaprootSignedTransaction> {
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

  public async signTransactionWithExtendedSecretKey(
    transaction: BitcoinTaprootUnsignedTransaction,
    secretKey: ExtendedSecretKey
  ): Promise<BitcoinTaprootSignedTransaction> {
    const encodedExtendedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(secretKey, { format: 'encoded', type: 'xprv' })
    const bip32: BIP32Interface = this.bip32.fromBase58(encodedExtendedSecretKey.value)

    const decodedPSBT: bitcoin.Psbt = this.bitcoinJS.lib.Psbt.fromHex(transaction.psbt)

    decodedPSBT.data.inputs.forEach((input, index) => {
      input.tapBip32Derivation?.forEach((deriv) => {
        try {
          const cutoffFrom = deriv.path.lastIndexOf("'") || deriv.path.lastIndexOf('h')
          const childPath = deriv.path.substr(cutoffFrom + 2)
          const childNode = bip32.derivePath(childPath)

          const tweakedChildNode = childNode.tweak(
            this.bitcoinJS.lib.crypto.taggedHash('TapTweak', Buffer.from(childNode.publicKey.subarray(1, 33)))
          )

          decodedPSBT.signInput(index, {
            publicKey: Buffer.from(tweakedChildNode.publicKey),
            sign: (hash: Buffer, lowR?: boolean) => Buffer.from(tweakedChildNode.sign(hash, lowR)),
            signSchnorr: (hash: Buffer) => Buffer.from(tweakedChildNode.signSchnorr(hash))
          })
        } catch (e) {
          throw new Error(`Error signing index #${index}`)
        }
      })
    })
    return newSignedTransaction<BitcoinTaprootSignedTransaction>({ psbt: decodedPSBT.toHex() })
  }

  public async signTransactionWithNonExtendedSecretKey(
    transaction: UnsignedTransaction,
    secretKey: SecretKey
  ): Promise<BitcoinTaprootSignedTransaction> {
    throw new UnsupportedError(Domain.BITCOIN, 'Sign with non extended secret key not supported (Taproot).')
  }

  public async getMetadata(): Promise<ProtocolMetadata<BitcoinUnits, BitcoinUnits>> {
    return this.metadata
  }

  public getAddressFromPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
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

  public async getAddressFromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey): Promise<string> {
    const encodedExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })

    const payment: bitcoin.Payment = this.bitcoinJS.lib.payments.p2tr({
      internalPubkey: Buffer.from(encodedExtendedPublicKey.value, 'hex').subarray(1, 33),
      network: this.bitcoinJS.config.network
    })

    return BitcoinTaprootAddress.fromPayment(payment).asString()
  }

  public async getDetailsFromTransaction(
    transaction: BitcoinTaprootSignedTransaction | BitcoinTaprootUnsignedTransaction,
    _publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<BitcoinUnits>[]> {
    return this.getDetailsFromPSBT(transaction.psbt, _publicKey)
  }

  public async getDetailsFromPSBT(psbt: string, publicKey: any): Promise<AirGapTransaction<BitcoinUnits>[]> {
    const decodedPSBT: bitcoin.Psbt = this.bitcoinJS.lib.Psbt.fromHex(psbt)

    let fee: BigNumber = new BigNumber(0)
    for (const txIn of decodedPSBT.data.inputs) {
      fee = fee.plus(new BigNumber(txIn.witnessUtxo?.value ?? 0))
    }

    for (const txOut of decodedPSBT.txOutputs) {
      fee = fee.minus(new BigNumber(txOut.value))
    }

    const alerts: AirGapUIAlert[] = []
    const clonedPSBT = decodedPSBT.clone()
    eachRecursive(clonedPSBT) // Convert all buffers to hex strings

    const amount: BigNumber = (() => {
      if (decodedPSBT.txOutputs.length === 1) {
        return new BigNumber(decodedPSBT.txOutputs[0].value)
      }

      const unknownKeyVals = decodedPSBT.data.globalMap.unknownKeyVals
      if (unknownKeyVals) {
        const amountArray = unknownKeyVals.filter((kv) => kv.key.equals(Buffer.from('amount')))
        if (amountArray.length > 0) {
          return new BigNumber(amountArray[0].value.toString())
        }
      }

      let accumulated = new BigNumber(0)
      let useAccumulated = false
      decodedPSBT.data.outputs.forEach((outputKeyValues, index) => {
        if (outputKeyValues.unknownKeyVals) {
          const derivationPaths = outputKeyValues.unknownKeyVals
            .filter((kv) => kv.key.equals(Buffer.from('dp')))
            .map((kv) => kv.value.toString())

          if (derivationPaths.length > 0) {
            useAccumulated = true
            return
          }
        }
        const output = decodedPSBT.txOutputs[index]
        accumulated = accumulated.plus(output.value)
      })

      if (useAccumulated) {
        return accumulated
      }

      return decodedPSBT.txOutputs
        .map((obj) => new BigNumber(obj.value))
        .reduce((accumulator, currentValue) => accumulator.plus(currentValue))
    })()

    const changeAddressDatas = await Promise.all(
      decodedPSBT.data.outputs.map(async (obj, index) => {
        let isChangeAddress = false
        let isOwned = false
        let addressIndex = 0

        const address = decodedPSBT.txOutputs[index].address
        const amount = decodedPSBT.txOutputs[index].value
        let ourGeneratedAddress: string

        if (obj.bip32Derivation) {
          isChangeAddress = true
          const getIndexes = obj.bip32Derivation[0].path.split('/')

          if (publicKey.type === 'xpub') {
            const ourPublickey = await this.deriveFromExtendedPublicKey(publicKey, 1, +getIndexes[getIndexes.length - 1])
            ourGeneratedAddress = await this.getAddressFromPublicKey(ourPublickey)
          } else {
            ourGeneratedAddress = await this.getAddressFromNonExtendedPublicKey(publicKey)
          }

          if (ourGeneratedAddress === address) {
            isOwned = true
            addressIndex = +getIndexes[getIndexes.length - 1]
          }
          for (let x = 0; x < 1000; x++) {
            const ourPublickey = await this.deriveFromExtendedPublicKey(publicKey as ExtendedPublicKey, 1, x)
            ourGeneratedAddress = await this.getAddressFromPublicKey(ourPublickey)

            if (ourGeneratedAddress === address) {
              isOwned = true
              addressIndex = x
              break
            }
          }
        } else if (obj.tapBip32Derivation) {
          isChangeAddress = true
          const getIndexes = obj.tapBip32Derivation[0].path.split('/')

          if (publicKey.type === 'xpub') {
            const ourPublickey = await this.deriveFromExtendedPublicKey(publicKey, 1, +getIndexes[getIndexes.length - 1])
            ourGeneratedAddress = await this.getAddressFromPublicKey(ourPublickey)
          } else {
            ourGeneratedAddress = await this.getAddressFromNonExtendedPublicKey(publicKey)
          }

          if (ourGeneratedAddress === address) {
            isOwned = true
            addressIndex = +getIndexes[getIndexes.length - 1]
          }
          for (let x = 0; x < 1000; x++) {
            const ourPublickey = await this.deriveFromExtendedPublicKey(publicKey as ExtendedPublicKey, 1, x)
            ourGeneratedAddress = await this.getAddressFromPublicKey(ourPublickey)

            if (ourGeneratedAddress === address) {
              isOwned = true
              addressIndex = x
              break
            }
          }
        } else if (obj.unknownKeyVals) {
          for (let x = 0; x < 1000; x++) {
            isChangeAddress = true

            const ourPublickey = await this.deriveFromExtendedPublicKey(publicKey as ExtendedPublicKey, 1, x)
            ourGeneratedAddress = await this.getAddressFromPublicKey(ourPublickey)

            if (ourGeneratedAddress === address) {
              isOwned = true
              addressIndex = x
              break
            }
          }
        }

        if (isChangeAddress && isOwned) {
          alerts.push({
            type: 'success',
            title: { type: 'plain', value: '' },
            description: { type: 'plain', value: 'Note: your change address has been verified' },
            icon: undefined,
            actions: undefined
          })
        } else if (isChangeAddress && !isOwned) {
          alerts.push({
            type: 'warning',
            title: { type: 'plain', value: '' },
            description: { type: 'plain', value: 'Note: your change address has not been verified' },
            icon: undefined,
            actions: undefined
          })
        }

        return [
          address as string,
          {
            isChangeAddress,
            isOwned,
            path: addressIndex === 0 ? '' : `m/86'/0'/0'/1/${addressIndex}`,
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
        from: decodedPSBT.data.inputs.map(
          (obj) =>
            obj.tapBip32Derivation
              ?.map(
                (el) =>
                  this.bitcoinJS.lib.payments.p2tr({
                    internalPubkey: el.pubkey,
                    network: this.bitcoinJS.lib.networks.bitcoin
                  }).address
              )
              .join(' ') ?? 'INVALID'
        ),
        to: decodedPSBT.txOutputs.map((obj) => {
          return obj.address || `Script: ${obj.script.toString('hex')}` || 'unknown'
        }),
        isInbound: false,
        amount: newAmount(amount, 'blockchain'),
        fee: newAmount(fee, 'blockchain'),
        network: this.options.network,
        changeAddressInfo,
        uiAlerts: alerts,
        json: {
          inputTx: eachRecursive(clonedPSBT.txInputs),
          outputTx: eachRecursive(clonedPSBT.txOutputs),
          inputData: clonedPSBT.data.inputs,
          outputData: clonedPSBT.data.outputs,
          PSBTVersion: clonedPSBT.version,
          PSBTLocktime: clonedPSBT.locktime,
          PSBTGlobalMap: clonedPSBT.data.globalMap,
          rawPSBT: psbt
        }
      }
    ]
  }

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
    const encodedExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })
    const page: number = cursor?.page ?? 1

    const url: string = `${this.options.network.indexerApi}/api/v2/xpub/tr(${encodedExtendedPublicKey.value})?details=txs&tokens=used&pageSize=${limit}&page=${page}`
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
        }

        for (const vout of transaction.vout) {
          if (vout.addresses) {
            tempAirGapTransactionTo.push(...vout.addresses)
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

  public async getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<BitcoinUnits>> {
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
    const encodedExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })

    const { data } = await axios.get(`${this.options.network.indexerApi}/api/v2/xpub/tr(${encodedExtendedPublicKey.value})?pageSize=1`, {
      responseType: 'json'
    })

    return {
      total: newAmount(data.balance, 'blockchain')
    }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: Address[],
    configuration?: TransactionFullConfiguration<BitcoinUnits> | undefined
  ): Promise<Amount<BitcoinUnits>> {
    return this.segwit.getTransactionMaxAmountWithPublicKey(publicKey, to, configuration)
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<BitcoinUnits>> {
    return this.segwit.getTransactionFeeWithPublicKey(publicKey, details, configuration)
  }

  public async broadcastTransaction(transaction: BitcoinTaprootSignedTransaction): Promise<string> {
    const psbt = this.bitcoinJS.lib.Psbt.fromHex(transaction.psbt)

    // Verify and finalize each Taproot input
    psbt.data.inputs.forEach((input, index) => {
      if (input.tapInternalKey) {
        try {
          const finalized = psbt.finalizeTaprootInput(index)
          if (!finalized) {
            throw new Error(`Failed to finalize Taproot input #${index}`)
          }
        } catch (error) {
          throw new Error(`Error finalizing Taproot input #${index}: ${error}`)
        }
      }
    })

    // Extract and broadcast the finalized transaction
    const hexTransaction = psbt.extractTransaction().toHex()
    const { data } = await axios.post(`${this.options.network.indexerApi}/api/v2/sendtx/`, hexTransaction)

    return data.result
    // return ''
  }

  public async getExtendedKeyPairFromDerivative(derivative: CryptoDerivative): Promise<ExtendedKeyPair> {
    const bip32: BIP32Interface = this.derivativeToBip32Node(derivative)

    return {
      secretKey: newExtendedSecretKey(bip32.toBase58(), 'encoded'),
      publicKey: convertExtendedPublicKey(newExtendedPublicKey(bip32.neutered().toBase58(), 'encoded'), {
        format: 'encoded',
        type: 'xpub'
      })
    }
  }

  private derivativeToBip32Node(derivative: CryptoDerivative): BIP32Interface {
    const extendedSecretKey: ExtendedSecretKey = this.convertCryptoDerivative(derivative)

    return this.bip32.fromBase58(extendedSecretKey.value, this.bitcoinJS.config.network)
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

    return convertExtendedSecretKey(extendedSecretKey, { format: 'encoded', type: 'xprv' })
  }

  public async deriveFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<SecretKey> {
    return this.segwit.deriveFromExtendedSecretKey(extendedSecretKey, visibilityIndex, addressIndex)
  }

  public async deriveFromExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    const encodedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })
    const derivedBip32: BIP32Interface = this.bip32
      .fromBase58(encodedPublicKey.value, this.bitcoinJS.config.network)
      .derive(visibilityIndex)
      .derive(addressIndex)

    return newPublicKey(Buffer.from(derivedBip32.publicKey).toString('hex'), 'hex')
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature> {
    return this.segwit.signMessageWithKeyPair(message, keyPair)
  }

  public async verifyMessageWithPublicKey(
    message: string,
    signature: Signature,
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<boolean> {
    return this.segwit.verifyMessageWithPublicKey(message, signature, publicKey)
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair | ExtendedKeyPair): Promise<string> {
    return this.segwit.decryptAsymmetricWithKeyPair(payload, keyPair)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return this.segwit.encryptAsymmetricWithPublicKey(payload, publicKey)
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.segwit.encryptAESWithSecretKey(payload, secretKey)
  }

  public decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.segwit.decryptAESWithSecretKey(payload, secretKey)
  }

  public async getBalanceOfAddress(address: Address, configuration?: undefined): Promise<Balance<BitcoinUnits>> {
    return this.segwit.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddresses(addresses: Address[], configuration?: undefined): Promise<Balance<BitcoinUnits>> {
    return this.segwit.getBalanceOfAddresses(addresses)
  }

  // Common methods similar to Segwit implementation
  // ... [Include all the common methods from Segwit implementation but modify for Taproot]

  private async getAddressFromNonExtendedPublicKey(publicKey: PublicKey): Promise<string> {
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')
    const payment: bitcoin.Payment = this.bitcoinJS.lib.payments.p2tr({
      internalPubkey: Buffer.from(hexPublicKey.value, 'hex').subarray(1, 33),
      network: this.bitcoinJS.config.network
    })

    return BitcoinTaprootAddress.fromPayment(payment).asString()
  }

  private async prepareTransactionWithExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: TaprootTransactionFullConfiguration<BitcoinUnits>
  ): Promise<BitcoinTaprootUnsignedTransaction> {
    if (configuration?.masterFingerprint === undefined) {
      throw new ConditionViolationError(Domain.BITCOIN, 'Master fingerprint not set.')
    }

    let fee: Amount<BitcoinUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<BitcoinUnits> = await this.getTransactionFeeWithPublicKey(extendedPublicKey, details)
      fee = estimatedFee.medium
    }

    const wrappedFee: BigNumber = new BigNumber(newAmount(fee).blockchain(this.segwit.legacy.units).value)

    const transaction: BitcoinUnsignedTransaction = newUnsignedTransaction({
      ins: [],
      outs: []
    })

    const { data: utxos }: { data: UTXOResponse[] } = await axios.get<UTXOResponse[]>(
      `${this.options.network.indexerApi}/api/v2/utxo/tr(${extendedPublicKey.value})?confirmed=true`,
      {
        responseType: 'json'
      }
    )

    if (utxos.length <= 0) {
      throw new BalanceError(Domain.BITCOIN, 'Not enough balance.') // no transactions found on those addresses, probably won't find anything in the next ones
    }

    const totalRequiredBalance: BigNumber = details
      .map(({ amount }) => new BigNumber(newAmount(amount).blockchain(this.segwit.legacy.units).value))
      .reduce((accumulator: BigNumber, currentValue: BigNumber) => accumulator.plus(currentValue))
      .plus(wrappedFee)
    let valueAccumulator: BigNumber = new BigNumber(0)

    const getPathIndexes = (path: string): [number, number] => {
      const result = path
        .split('/')
        .slice(-2)
        .map((item) => parseInt(item))
        .filter((item) => !isNaN(item))

      if (result.length !== 2) {
        throw new Error('Unexpected path format')
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
          derivationPath: utxo.path
        })
      } else {
        throw new Error('Invalid address returned from API')
      }

      if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
        break
      }
    }

    if (valueAccumulator.isLessThan(totalRequiredBalance)) {
      throw new Error('not enough balance 2')
    }

    for (let i = 0; i < details.length; i++) {
      const value: string = newAmount(details[i].amount).blockchain(this.segwit.legacy.units).value

      transaction.outs.push({
        recipient: details[i].to,
        isChange: false,
        value
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
        derivationPath: `1/${changeAddressIndex}`
      })
    }

    const psbt: bitcoin.Psbt = new this.bitcoinJS.lib.Psbt()

    // We add the total amount of the transaction to the global map. This can be used to show the info in the "from-to" component after the transaction was signed.
    psbt.addUnknownKeyValToGlobal({
      key: Buffer.from('amount'),
      value: Buffer.from(
        details
          .reduce((accumulator: BigNumber, next: TransactionDetails<BitcoinUnits>) => {
            return accumulator.plus(newAmount(next.amount).blockchain(this.segwit.legacy.units).value)
          }, new BigNumber(0))
          .toString()
      )
    })

    const xpubExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })
    const keyPair: BIP32Interface = this.bip32.fromBase58(xpubExtendedPublicKey.value)

    const replaceByFee: boolean = configuration?.replaceByFee ? true : false

    transaction.ins.forEach((tx) => {
      const indexes: [number, number] = getPathIndexes(tx.derivationPath!)

      const childNode: BIP32Interface = keyPair.derivePath(indexes.join('/'))

      const xOnlyPubkey = childNode.publicKey.length === 33 ? childNode.publicKey.slice(1, 33) : childNode.publicKey

      const payment: bitcoin.Payment = this.bitcoinJS.lib.payments.p2tr({
        internalPubkey: Buffer.from(xOnlyPubkey),
        network: this.bitcoinJS.config.network
      })

      const inputCommon = {
        hash: tx.txId,
        index: tx.vout,
        sequence: replaceByFee ? 0xfffffffd : undefined,
        witnessUtxo: {
          script: payment.output!,
          value: parseInt(tx.value, 10)
        }
      }

      const p2shOutput: Buffer | undefined = payment.output

      if (!p2shOutput) {
        throw new Error('no p2shOutput')
      }

      const fingerprintBuffer = Buffer.from(configuration.masterFingerprint.value, 'hex')

      psbt.addInput({
        ...inputCommon,
        tapInternalKey: Buffer.from(xOnlyPubkey),
        tapBip32Derivation: [
          {
            leafHashes: [],
            path: tx.derivationPath!,
            pubkey: Buffer.from(xOnlyPubkey),
            masterFingerprint: fingerprintBuffer
          }
        ]
      })
    })

    transaction.outs.forEach((out, index) => {
      psbt.addOutput({ address: out.recipient, value: parseInt(out.value, 10) })
      if (out.derivationPath) {
        psbt.addUnknownKeyValToOutput(index, {
          key: Buffer.from('dp'),
          value: Buffer.from(out.derivationPath, 'utf8')
        })
      }
    })

    return newUnsignedTransaction<BitcoinTaprootUnsignedTransaction>({ psbt: psbt.toHex() })
  }
}

// Factory

export function createBitcoinTaprootProtocol(options: RecursivePartial<BitcoinProtocolOptions> = {}): BitcoinTaprootProtocol {
  return new BitcoinTaprootProtocolImpl(options)
}
