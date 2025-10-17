import { assertNever, Domain } from '@airgap/coinlib-core'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { BalanceError, ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { encodeDerivative } from '@airgap/crypto'
import {
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
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  Signature,
  TransactionDetails,
  TransactionSimpleConfiguration,
  AirGapUIAlert
} from '@airgap/module-kit'
import * as bitcoin from 'bitcoinjs-lib'

import { BitcoinLegacyJS } from '../types/bitcoinjs'
import { BitcoinCryptoConfiguration } from '../types/crypto'
import { UTXOResponse } from '../types/indexer'
import { BitcoinProtocolNetwork, BitcoinProtocolOptions, BitcoinUnits } from '../types/protocol'
import {
  BitcoinLegacySignedTransaction,
  BitcoinLegacyUnsignedTransaction,
  BitcoinTransactionCursor,
  BitcoinUnsignedTransaction,
  LegacyTransactionFullConfiguration
} from '../types/transaction'
import { eachRecursive } from '../utils/common'
import { convertExtendedPublicKey, convertExtendedSecretKey, convertPublicKey } from '../utils/key'
import { getBitcoinJSNetwork } from '../utils/network'

import { BIP32Factory, BIP32Interface } from 'bip32'

import ecc from '@bitcoinerlab/secp256k1'
import { BitcoinProtocol, BitcoinProtocolImpl, createBitcoinProtocolOptions } from './BitcoinProtocol'
import { BitcoinLegacyAddress } from '../data/BitcoinLegacyAddress'

// Interface

export interface BitcoinLegacyProtocol extends BitcoinProtocol<BitcoinLegacySignedTransaction, BitcoinLegacyUnsignedTransaction> {
  _isBitcoinProtocol: true

  prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration: LegacyTransactionFullConfiguration<BitcoinUnits>
  ): Promise<BitcoinLegacyUnsignedTransaction>
}

// Implementation

const DUST_AMOUNT: number = 50

export class BitcoinLegacyProtocolImpl implements BitcoinLegacyProtocol {
  public readonly _isBitcoinProtocol: true = true

  private readonly options: BitcoinProtocolOptions
  public readonly bitcoinJS: BitcoinLegacyJS
  public readonly legacy: BitcoinProtocolImpl
  private readonly metadata: ProtocolMetadata<BitcoinUnits>

  constructor(options: RecursivePartial<BitcoinProtocolOptions> = {}, bitcoinJS: typeof bitcoin = bitcoin) {
    this.options = createBitcoinProtocolOptions(options.network)
    this.bitcoinJS = {
      lib: bitcoinJS,
      config: {
        network: getBitcoinJSNetwork(this.options.network, bitcoinJS)
      }
    }
    this.bitcoinJS.lib.initEccLib(ecc)

    this.legacy = new BitcoinProtocolImpl(options)

    this.metadata = this.legacy.metadata
  }

  private readonly bip32 = BIP32Factory(ecc)

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
    const payment: bitcoin.Payment = this.bitcoinJS.lib.payments.p2pkh({ pubkey: Buffer.from(hexPublicKey.value, 'hex') })

    return BitcoinLegacyAddress.fromPayment(payment).asString()
  }

  private async getAddressFromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey): Promise<string> {
    const encodedExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })
    const bip32: BIP32Interface = this.bip32.fromBase58(encodedExtendedPublicKey.value, this.bitcoinJS.config.network)

    return BitcoinLegacyAddress.fromBip32(bip32).asString()
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

  public async getDetailsFromTransaction(
    transaction: BitcoinLegacySignedTransaction | BitcoinLegacyUnsignedTransaction,
    _publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<BitcoinUnits>[]> {
    return this.getDetailsFromPSBT(transaction.psbt, _publicKey)
  }

  private async getDetailsFromPSBT(psbt: string, publickey: PublicKey | ExtendedPublicKey): Promise<AirGapTransaction<BitcoinUnits>[]> {
    const decodedPSBT: bitcoin.Psbt = this.bitcoinJS.lib.Psbt.fromHex(psbt)

    let inTotal = new BigNumber(0)
    for (let i = 0; i < decodedPSBT.data.inputs.length; i++) {
      const input = decodedPSBT.data.inputs[i]
      if (input.witnessUtxo) {
        inTotal = inTotal.plus(input.witnessUtxo.value)
      } else if (input.nonWitnessUtxo) {
        // bitcoinjs-lib v6: prevout index comes from the underlying unsigned tx
        const prevIndex = decodedPSBT.txInputs[i].index
        const prevTx = this.bitcoinJS.lib.Transaction.fromBuffer(input.nonWitnessUtxo)
        inTotal = inTotal.plus(prevTx.outs[prevIndex].value)
      } else {
        throw new UnsupportedError(Domain.BITCOIN, 'PSBT input missing UTXO data.')
      }
    }

    let fee: BigNumber = inTotal

    for (const o of decodedPSBT.txOutputs) {
      fee = fee.minus(o.value)
    }

    const alerts: AirGapUIAlert[] = []

    const clonedPSBT = decodedPSBT.clone()

    eachRecursive(clonedPSBT)

    const amount: BigNumber = (() => {
      if (decodedPSBT.txOutputs.length === 1) {
        return new BigNumber(decodedPSBT.txOutputs[0].value)
      }

      {
        const unknownKeyVals = decodedPSBT.data.globalMap.unknownKeyVals
        if (unknownKeyVals) {
          const amountArray = unknownKeyVals.filter((kv) => kv.key.equals(Buffer.from('amount')))
          if (amountArray.length > 0) {
            return new BigNumber(amountArray[0].value.toString())
          }
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

          if (publickey.type === 'xpub') {
            const ourPublickey = await this.deriveFromExtendedPublicKey(publickey, 1, +getIndexes[getIndexes.length - 1])
            ourGeneratedAddress = await this.getAddressFromPublicKey(ourPublickey)
          } else {
            ourGeneratedAddress = await this.getAddressFromNonExtendedPublicKey(publickey)
          }

          if (ourGeneratedAddress === address) {
            isOwned = true
            addressIndex = +getIndexes[getIndexes.length - 1]
          }
          for (let x = 0; x < 1000; x++) {
            const ourPublickey = await this.deriveFromExtendedPublicKey(publickey as ExtendedPublicKey, 1, x)
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

            const ourPublickey = await this.deriveFromExtendedPublicKey(publickey as ExtendedPublicKey, 1, x)
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
          alerts.push({
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
            path: addressIndex === 0 ? '' : `m/44'/0'/0'/1/${addressIndex}`,
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
            obj.bip32Derivation
              ?.map(
                (el) =>
                  this.bitcoinJS.lib.payments.p2pkh({
                    pubkey: el.pubkey,
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

  public async verifyMessageWithPublicKey(
    message: string,
    signature: Signature,
    publicKey: ExtendedPublicKey | PublicKey
  ): Promise<boolean> {
    return this.legacy.verifyMessageWithPublicKey(message, signature, publicKey)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: ExtendedPublicKey | PublicKey): Promise<string> {
    return this.legacy.encryptAsymmetricWithPublicKey(payload, publicKey)
  }

  public async getCryptoConfiguration(): Promise<BitcoinCryptoConfiguration> {
    return this.legacy.getCryptoConfiguration()
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    const bip32: BIP32Interface = this.derivativeToBip32Node(derivative)
    const privateKeyUint8: Uint8Array | undefined = bip32.privateKey
    if (privateKeyUint8 === undefined) {
      throw new Error('No private key!')
    }
    const privateKey: Buffer = Buffer.from(privateKeyUint8)

    const publicKeyUint8: Uint8Array = bip32.publicKey
    const publicKey: Buffer = Buffer.from(publicKeyUint8)

    return {
      secretKey: newSecretKey(privateKey.toString('hex'), 'hex'),
      publicKey: newPublicKey(publicKey.toString('hex'), 'hex')
    }
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

  public async deriveFromExtendedSecretKey(
    extendedSecretKey: ExtendedSecretKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<SecretKey> {
    const encodedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(extendedSecretKey, { format: 'encoded', type: 'xprv' })
    const derivedBip32: BIP32Interface = this.bip32
      .fromBase58(encodedSecretKey.value, this.bitcoinJS.config.network)
      .derive(visibilityIndex)
      .derive(addressIndex)

    const privateKeyUint8: Uint8Array | undefined = derivedBip32.privateKey
    if (privateKeyUint8 === undefined) {
      throw new Error('No private key!')
    }
    const privateKey: Buffer = Buffer.from(privateKeyUint8)

    return newSecretKey(privateKey.toString('hex'), 'hex')
  }

  public async signTransactionWithSecretKey(
    transaction: BitcoinLegacyUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<BitcoinLegacySignedTransaction> {
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
    transaction: BitcoinLegacyUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<BitcoinLegacySignedTransaction> {
    throw new UnsupportedError(Domain.BITCOIN, 'Sign with non extended secret key not supported')
  }

  private async signTransactionWithExtendedSecretKey(
    transaction: BitcoinLegacyUnsignedTransaction,
    extendedSecretKey: ExtendedSecretKey
  ): Promise<BitcoinLegacySignedTransaction> {
    const encodedExtendedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(extendedSecretKey, { format: 'encoded', type: 'xprv' })
    const bip32: BIP32Interface = this.bip32.fromBase58(encodedExtendedSecretKey.value)

    const decodedPSBT: bitcoin.Psbt = this.bitcoinJS.lib.Psbt.fromHex(transaction.psbt)

    decodedPSBT.data.inputs.forEach((input, index) => {
      input.bip32Derivation?.forEach((deriv) => {
        try {
          // This uses the same logic to find child key as the "findWalletByFingerprintDerivationPathAndProtocolIdentifier" method in the Vault
          const cutoffFrom = deriv.path.lastIndexOf("'") || deriv.path.lastIndexOf('h')
          const childPath = deriv.path.substr(cutoffFrom + 2)
          const childNode = bip32.derivePath(childPath)
          // Wrap publicKey as Buffer to match Signer interface
          decodedPSBT.signInput(index, {
            publicKey: Buffer.from(childNode.publicKey),
            sign: (hash: Buffer, lowR?: boolean) => Buffer.from(childNode.sign(hash, lowR))
          })
        } catch (e) {}
      })
    })

    return newSignedTransaction<BitcoinLegacySignedTransaction>({ psbt: decodedPSBT.toHex() })
  }

  public async signMessageWithKeyPair(message: string, keyPair: ExtendedKeyPair | KeyPair): Promise<Signature> {
    return this.legacy.signMessageWithKeyPair(message, keyPair)
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: ExtendedKeyPair | KeyPair): Promise<string> {
    return this.legacy.decryptAsymmetricWithKeyPair(payload, keyPair)
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.legacy.encryptAESWithSecretKey(payload, secretKey)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string> {
    return this.legacy.decryptAESWithSecretKey(payload, secretKey)
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
    return this.legacy.getTransactionsForPublicKey(publicKey, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits>> {
    return this.legacy.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<BitcoinTransactionCursor, BitcoinUnits>> {
    return this.legacy.getTransactionsForAddresses(addresses, limit, cursor)
  }

  public async getBalanceOfPublicKey(publicKey: ExtendedPublicKey | PublicKey): Promise<Balance<BitcoinUnits>> {
    return this.legacy.getBalanceOfPublicKey(publicKey)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<BitcoinUnits>> {
    return this.legacy.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<BitcoinUnits>> {
    return this.legacy.getBalanceOfAddresses(addresses)
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: ExtendedPublicKey | PublicKey,
    to: string[],
    configuration?: LegacyTransactionFullConfiguration<BitcoinUnits>
  ): Promise<Amount<BitcoinUnits>> {
    return this.legacy.getTransactionMaxAmountWithPublicKey(publicKey, to, configuration)
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: ExtendedPublicKey | PublicKey,
    _details: TransactionDetails<BitcoinUnits>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<FeeDefaults<BitcoinUnits>> {
    return this.legacy.getTransactionFeeWithPublicKey(_publicKey, _details, _configuration)
  }

  public async prepareTransactionWithPublicKey(
    publicKey: ExtendedPublicKey | PublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: LegacyTransactionFullConfiguration<BitcoinUnits>
  ): Promise<BitcoinLegacyUnsignedTransaction> {
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
    configuration?: LegacyTransactionFullConfiguration<BitcoinUnits>
  ): Promise<BitcoinLegacyUnsignedTransaction> {
    throw new UnsupportedError(Domain.BITCOIN, 'Prepare transaction with non extended public key not supported')
  }

  private async prepareTransactionWithExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: LegacyTransactionFullConfiguration<BitcoinUnits>
  ): Promise<BitcoinLegacyUnsignedTransaction> {
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

    const wrappedFee: BigNumber = new BigNumber(newAmount(fee).blockchain(this.legacy.units).value)

    const transaction: BitcoinUnsignedTransaction = newUnsignedTransaction({
      ins: [],
      outs: []
    })

    const { data: utxos }: { data: UTXOResponse[] } = await axios.get<UTXOResponse[]>(
      `${this.options.network.indexerApi}/api/v2/utxo/${extendedPublicKey.value}?confirmed=true`,
      {
        responseType: 'json'
      }
    )

    if (utxos.length <= 0) {
      throw new BalanceError(Domain.BITCOIN, 'Not enough balance.')
    }

    const totalRequiredBalance: BigNumber = details
      .map(({ amount }) => new BigNumber(newAmount(amount).blockchain(this.legacy.units).value))
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
      const value: string = newAmount(details[i].amount).blockchain(this.legacy.units).value

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

    psbt.addUnknownKeyValToGlobal({
      key: Buffer.from('amount'),
      value: Buffer.from(
        details
          .reduce((accumulator: BigNumber, next: TransactionDetails<BitcoinUnits>) => {
            return accumulator.plus(newAmount(next.amount).blockchain(this.legacy.units).value)
          }, new BigNumber(0))
          .toString()
      )
    })

    const xpubExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })
    const keyPair: BIP32Interface = this.bip32.fromBase58(xpubExtendedPublicKey.value)

    const replaceByFee: boolean = configuration?.replaceByFee ? true : false

    for (const tx of transaction.ins) {
      const indexes: [number, number] = getPathIndexes(tx.derivationPath!)

      const childNode: BIP32Interface = keyPair.derivePath(indexes.join('/'))

      const { data } = await axios.get<{ hex: string }>(`${this.options.network.indexerApi}/api/v2/tx/${tx.txId}`, {
        responseType: 'json'
      })

      const prevTxHex = data.hex
      if (!prevTxHex) {
        throw new Error(`Missing prev tx hex for ${tx.txId}`)
      }

      psbt.addInput({
        hash: tx.txId,
        index: tx.vout,
        sequence: replaceByFee ? 0xfffffffd : undefined,
        nonWitnessUtxo: Buffer.from(prevTxHex, 'hex'),
        bip32Derivation: [
          {
            masterFingerprint: Buffer.from(configuration.masterFingerprint.value, 'hex'),
            pubkey: Buffer.from(childNode.publicKey),
            path: tx.derivationPath!
          }
        ]
      })
    }

    transaction.outs.forEach((out, index) => {
      psbt.addOutput({ address: out.recipient, value: parseInt(out.value, 10) })
      if (out.derivationPath) {
        psbt.addUnknownKeyValToOutput(index, {
          key: Buffer.from('dp'),
          value: Buffer.from(out.derivationPath, 'utf8')
        })
      }
    })

    return newUnsignedTransaction<BitcoinLegacyUnsignedTransaction>({ psbt: psbt.toHex() })
  }

  public async broadcastTransaction(transaction: BitcoinLegacySignedTransaction): Promise<string> {
    const hexTransaction: string = this.bitcoinJS.lib.Psbt.fromHex(transaction.psbt).finalizeAllInputs().extractTransaction().toHex()

    const { data } = await axios.post(`${this.options.network.indexerApi}/api/v2/sendtx/`, hexTransaction)

    return data.result
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

  private derivativeToBip32Node(derivative: CryptoDerivative) {
    const extendedSecretKey: ExtendedSecretKey = this.convertCryptoDerivative(derivative)

    return this.bip32.fromBase58(extendedSecretKey.value, this.bitcoinJS.config.network)
  }
}

// Factory

export function createBitcoinLegacyProtocol(options: RecursivePartial<BitcoinProtocolOptions> = {}): BitcoinLegacyProtocol {
  return new BitcoinLegacyProtocolImpl(options)
}
