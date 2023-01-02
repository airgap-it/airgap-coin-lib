import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import { BalanceError, ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import {
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  AirGapUIAlert,
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
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  RecursivePartial,
  Secret,
  SecretKey,
  Signature,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'
import * as bitcoin from 'bitcoinjs-lib'

import { BitcoinSegwitAddress } from '../data/BitcoinSegwitAddress'
import { BitcoinSegwitJS } from '../types/bitcoinjs'
import { UTXOResponse } from '../types/indexer'
import { BitcoinProtocolNetwork, BitcoinProtocolOptions, BitcoinUnits } from '../types/protocol'
import {
  BitcoinSegwitSignedTransaction,
  BitcoinSegwitUnsignedTransaction,
  BitcoinTransactionCursor,
  BitcoinUnsignedTransaction,
  SegwitTransactionConfiguration
} from '../types/transaction'
import { eachRecursive } from '../utils/common'
import { convertExtendedPublicKey, convertExtendedSecretKey, convertPublicKey } from '../utils/key'
import { getBitcoinJSNetwork } from '../utils/network'

import { BitcoinProtocol, BitcoinProtocolImpl, createBitcoinProtocolOptions } from './BitcoinProtocol'

// Interface

export interface BitcoinSegwitProtocol extends BitcoinProtocol<BitcoinSegwitSignedTransaction, BitcoinSegwitUnsignedTransaction> {
  prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration: SegwitTransactionConfiguration<BitcoinUnits>
  ): Promise<BitcoinSegwitUnsignedTransaction>
}

// Implementation

const DUST_AMOUNT: number = 50

export class BitcoinSegwitProtocolImpl implements BitcoinSegwitProtocol {
  private readonly legacy: BitcoinProtocolImpl
  private readonly options: BitcoinProtocolOptions
  private readonly bitcoinJS: BitcoinSegwitJS

  public constructor(options: RecursivePartial<BitcoinProtocolOptions> = {}, bitcoinJS: typeof bitcoin = bitcoin) {
    this.legacy = new BitcoinProtocolImpl(options)
    this.options = createBitcoinProtocolOptions(options.network)

    this.bitcoinJS = {
      lib: bitcoinJS,
      config: {
        network: getBitcoinJSNetwork(this.options.network, bitcoinJS)
      }
    }

    this.metadata = {
      ...this.legacy.metadata,
      identifier: MainProtocolSymbols.BTC_SEGWIT,
      name: 'Bitcoin (Segwit)',
      account: {
        ...(this.legacy.metadata.account ?? {}),
        standardDerivationPath: `m/84'/0'/0'`,
        address: {
          ...(this.legacy.metadata.account?.address ?? {}),
          regex: 'bc1...'
        }
      }
    }
  }

  // Common

  private readonly metadata: ProtocolMetadata<BitcoinUnits>

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
    const payment: bitcoin.Payment = this.bitcoinJS.lib.payments.p2wpkh({ pubkey: Buffer.from(hexPublicKey.value, 'hex') })

    return BitcoinSegwitAddress.fromPayment(payment).asString()
  }

  private async getAddressFromExtendedPublicKey(extendedPublicKey: ExtendedPublicKey): Promise<string> {
    const encodedExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })
    const bip32: bitcoin.BIP32Interface = this.bitcoinJS.lib.bip32.fromBase58(encodedExtendedPublicKey.value, this.bitcoinJS.config.network)

    return BitcoinSegwitAddress.fromBip32(bip32).asString()
  }

  public async deriveFromExtendedPublicKey(
    publicKey: ExtendedPublicKey,
    visibilityIndex: number,
    addressIndex: number
  ): Promise<PublicKey> {
    const encodedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(publicKey, { format: 'encoded', type: 'xpub' })
    const derivedBip32: bitcoin.BIP32Interface = this.bitcoinJS.lib.bip32
      .fromBase58(encodedPublicKey.value, this.bitcoinJS.config.network)
      .derive(visibilityIndex)
      .derive(addressIndex)

    return newPublicKey(derivedBip32.publicKey.toString('hex'), 'hex')
  }

  public async getDetailsFromTransaction(
    transaction: BitcoinSegwitSignedTransaction | BitcoinSegwitUnsignedTransaction,
    _publicKey: PublicKey | ExtendedPublicKey
  ): Promise<AirGapTransaction<BitcoinUnits>[]> {
    return this.getDetailsFromPSBT(transaction.psbt)
  }

  private async getDetailsFromPSBT(psbt: string): Promise<AirGapTransaction<BitcoinUnits>[]> {
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

    eachRecursive(clonedPSBT) // All buffers to hex string

    // Amount is tricky for BTC. Full amount of inputs is always transferred, but usually a (big) part of the amount is sent back to the sender via change address. So it's not easy to determine what the amount is that the user intended to send.

    const amount: BigNumber = (() => {
      // If tx has only one output, this is the amount
      if (decodedPSBT.txOutputs.length === 1) {
        return new BigNumber(decodedPSBT.txOutputs[0].value)
      }

      // If we can match one output to an exact amount that we add to the PSBT, this is our amount.
      {
        const unknownKeyVals = decodedPSBT.data.globalMap.unknownKeyVals
        if (unknownKeyVals) {
          const amountArray = unknownKeyVals.filter((kv) => kv.key.equals(Buffer.from('amount')))
          if (amountArray.length > 0) {
            return new BigNumber(amountArray[0].value.toString()) // Buffer to number
          }
        }
      }

      // If tx has an output and we added a derivation path in the PSBT (in the wallet, prepareTransaction), we know that it is a change address and we ignore it.
      let accumulated = new BigNumber(0)
      let useAccumulated = false
      decodedPSBT.data.outputs.forEach((outputKeyValues, index) => {
        if (outputKeyValues.unknownKeyVals) {
          const derivationPaths = outputKeyValues.unknownKeyVals
            .filter((kv) => kv.key.equals(Buffer.from('dp')))
            .map((kv) => kv.value.toString())

          if (derivationPaths.length > 0) {
            // If one of the outputs has the derivation in the custom key/value map, we can use this to determine the amount.
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

      // If we cannot match anything above, we need to assume that the whole amount is being sent and the user has to check the outputs.
      return decodedPSBT.txOutputs
        .map((obj) => new BigNumber(obj.value))
        .reduce((accumulator, currentValue) => accumulator.plus(currentValue))
    })()

    return [
      {
        from: decodedPSBT.data.inputs.map(
          (obj) =>
            obj.bip32Derivation
              ?.map(
                (el) =>
                  this.bitcoinJS.lib.payments.p2wpkh({
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

        uiAlerts: alerts,

        json: {
          // This is some unstructured data about the PSBT. This is shown in the UI as a JSON for advanced users.
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
    publicKey: PublicKey | ExtendedPublicKey
  ): Promise<boolean> {
    return this.legacy.verifyMessageWithPublicKey(message, signature, publicKey)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string> {
    return this.legacy.encryptAsymmetricWithPublicKey(payload, publicKey)
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
    const bip32: bitcoin.BIP32Interface = this.bitcoinJS.lib.bip32.fromSeed(Buffer.from(secret, 'hex'), this.bitcoinJS.config.network)
    const derivedBip32: bitcoin.BIP32Interface = derivationPath ? bip32.derivePath(derivationPath) : bip32

    const privateKey: Buffer | undefined = derivedBip32.privateKey
    if (privateKey === undefined) {
      throw new Error('No private key!')
    }

    const publicKey: Buffer = derivedBip32.publicKey

    return {
      secretKey: newSecretKey(privateKey.toString('hex'), 'hex'),
      publicKey: newPublicKey(publicKey.toString('hex'), 'hex')
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
    const bip32: bitcoin.BIP32Interface = this.bitcoinJS.lib.bip32.fromSeed(Buffer.from(secret, 'hex'), this.bitcoinJS.config.network)
    const derivedBip32: bitcoin.BIP32Interface = derivationPath ? bip32.derivePath(derivationPath) : bip32

    return {
      secretKey: newExtendedSecretKey(derivedBip32.toBase58(), 'encoded'),
      publicKey: convertExtendedPublicKey(newExtendedPublicKey(derivedBip32.neutered().toBase58(), 'encoded'), {
        format: 'encoded',
        type: 'zpub'
      })
    }
  }

  private async getExtendedKeyPairFromMnemonic(mnemonic: string, derivationPath?: string, password?: string): Promise<ExtendedKeyPair> {
    const secret: Buffer = mnemonicToSeed(mnemonic, password)

    return this.getExtendedKeyPairFromHexSecret(secret.toString('hex'), derivationPath)
  }

  public async signTransactionWithSecretKey(
    transaction: BitcoinSegwitUnsignedTransaction,
    secretKey: SecretKey | ExtendedSecretKey
  ): Promise<BitcoinSegwitSignedTransaction> {
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
    transaction: BitcoinSegwitUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<BitcoinSegwitSignedTransaction> {
    // No reference implementation in v0
    throw new UnsupportedError(Domain.BITCOIN, 'Sign with non extended secret key not supported (Segwit).')
  }

  private async signTransactionWithExtendedSecretKey(
    transaction: BitcoinSegwitUnsignedTransaction,
    extendedSecretKey: ExtendedSecretKey
  ): Promise<BitcoinSegwitSignedTransaction> {
    const encodedExtendedSecretKey: ExtendedSecretKey = convertExtendedSecretKey(extendedSecretKey, 'encoded')
    const bip32: bitcoin.BIP32Interface = this.bitcoinJS.lib.bip32.fromBase58(encodedExtendedSecretKey.value)

    const decodedPSBT: bitcoin.Psbt = this.bitcoinJS.lib.Psbt.fromHex(transaction.psbt)

    decodedPSBT.data.inputs.forEach((input, index) => {
      input.bip32Derivation?.forEach((deriv) => {
        try {
          // This uses the same logic to find child key as the "findWalletByFingerprintDerivationPathAndProtocolIdentifier" method in the Vault
          const cutoffFrom = deriv.path.lastIndexOf("'") || deriv.path.lastIndexOf('h')
          const childPath = deriv.path.substr(cutoffFrom + 2)
          decodedPSBT.signInput(index, bip32.derivePath(childPath))
          console.log(`Signed input ${index} with path ${deriv.path}`)
        } catch (e) {
          console.log(`Error signing input ${index}`, e)
        }
      })
    })

    return newSignedTransaction<BitcoinSegwitSignedTransaction>({ psbt: decodedPSBT.toHex() })
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
    publicKey: PublicKey | ExtendedPublicKey,
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

  public async getBalanceOfPublicKey(publicKey: PublicKey | ExtendedPublicKey): Promise<Balance<BitcoinUnits>> {
    return this.legacy.getBalanceOfPublicKey(publicKey)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<BitcoinUnits>> {
    return this.legacy.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<Balance<BitcoinUnits>> {
    return this.legacy.getBalanceOfAddresses(addresses)
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    to: string[],
    configuration?: TransactionConfiguration<BitcoinUnits>
  ): Promise<Amount<BitcoinUnits>> {
    return this.legacy.getTransactionMaxAmountWithPublicKey(publicKey, to, configuration)
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[]
  ): Promise<FeeDefaults<BitcoinUnits>> {
    return this.getTransactionFeeWithPublicKey(publicKey, details)
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey | ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: SegwitTransactionConfiguration<BitcoinUnits>
  ): Promise<BitcoinSegwitUnsignedTransaction> {
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
    configuration?: SegwitTransactionConfiguration<BitcoinUnits>
  ): Promise<BitcoinSegwitUnsignedTransaction> {
    // No reference implementation in v0
    throw new UnsupportedError(Domain.BITCOIN, 'Prepare transaction with non extended public key not supported (Segwit).')
  }

  private async prepareTransactionWithExtendedPublicKey(
    extendedPublicKey: ExtendedPublicKey,
    details: TransactionDetails<BitcoinUnits>[],
    configuration?: SegwitTransactionConfiguration<BitcoinUnits>
  ): Promise<BitcoinSegwitUnsignedTransaction> {
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
      throw new BalanceError(Domain.BITCOIN, 'Not enough balance.') // no transactions found on those addresses, probably won't find anything in the next ones
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
            return accumulator.plus(newAmount(next.amount).blockchain(this.legacy.units).value)
          }, new BigNumber(0))
          .toString()
      )
    })

    const xpubExtendedPublicKey: ExtendedPublicKey = convertExtendedPublicKey(extendedPublicKey, { format: 'encoded', type: 'xpub' })
    const keyPair: bitcoin.BIP32Interface = this.bitcoinJS.lib.bip32.fromBase58(xpubExtendedPublicKey.value)

    const replaceByFee: boolean = configuration?.replaceByFee ? true : false
    transaction.ins.forEach((tx) => {
      const indexes: [number, number] = getPathIndexes(tx.derivationPath!)

      const childNode: bitcoin.BIP32Interface = keyPair.derivePath(indexes.join('/'))

      const p2wpkh: bitcoin.Payment = this.bitcoinJS.lib.payments.p2wpkh({
        pubkey: childNode.publicKey,
        network: this.bitcoinJS.config.network
      })

      const p2shOutput: Buffer | undefined = p2wpkh.output

      if (!p2shOutput) {
        throw new Error('no p2shOutput')
      }

      psbt.addInput({
        hash: tx.txId,
        index: tx.vout,
        sequence: replaceByFee ? 0xfffffffd : undefined, // Needs to be at least 2 below max int value to be RBF
        witnessUtxo: {
          script: p2shOutput,
          value: parseInt(tx.value, 10)
        },
        bip32Derivation: [
          {
            masterFingerprint: Buffer.from(configuration.masterFingerprint.value, 'hex'),
            pubkey: childNode.publicKey,
            path: tx.derivationPath!
          }
        ]
      })
    })

    transaction.outs.forEach((out, index) => {
      psbt.addOutput({ address: out.recipient, value: parseInt(out.value, 10) })
      if (out.derivationPath) {
        // We add the derivation path of our change address to the key value map of the PSBT. This will allow us to later "filter" out this address when displaying the transaction info.
        psbt.addUnknownKeyValToOutput(index, {
          key: Buffer.from('dp'),
          value: Buffer.from(out.derivationPath, 'utf8')
        })
      }
    })

    return newUnsignedTransaction<BitcoinSegwitUnsignedTransaction>({ psbt: psbt.toHex() })
  }

  public async broadcastTransaction(transaction: BitcoinSegwitSignedTransaction): Promise<string> {
    const hexTransaction: string = this.bitcoinJS.lib.Psbt.fromHex(transaction.psbt).finalizeAllInputs().extractTransaction().toHex()
    const { data } = await axios.post(`${this.options.network.indexerApi}/api/v2/sendtx/`, hexTransaction)

    return data.result
  }
}

// Factory

export function createBitcoinSegwitProtocol(options: RecursivePartial<BitcoinProtocolOptions> = {}): BitcoinSegwitProtocol {
  return new BitcoinSegwitProtocolImpl(options)
}
