// tslint:disable: max-classes-per-file
import { IAirGapTransaction, ProtocolSymbols, UnsignedTransaction } from '@airgap/coinlib-core'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2'
import { AirGapTransactionWarning } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import { MainProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import * as bitcoinJS from 'bitcoinjs-lib'
import { SignedBitcoinSegwitTransaction } from '../types/signed-transaction-bitcoin-segwit'

import { RawBitcoinSegwitTransaction, RawBitcoinTransaction } from '../types/transaction-bitcoin'

import { BitcoinProtocol, UTXOResponse } from './BitcoinProtocol'
import { BitcoinProtocolOptions } from './BitcoinProtocolOptions'
import { BitcoinSegwitAddress } from './BitcoinSegwitAddress'
import { BitcoinAddressCursor, BitcoinAddressResult } from './BitcoinTypes'
import { BIP32Factory } from 'bip32'
import ecc from '@bitcoinerlab/secp256k1'

const DUST_AMOUNT = 50

// This function handles arrays and objects
function eachRecursive(obj: Object | Object[]) {
  for (var k in obj) {
    if (Buffer.isBuffer(obj[k])) {
      obj[k] = obj[k].toString('hex')
    }
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      obj[k] = eachRecursive(obj[k])
    }
  }
  return obj
}

// https://github.com/satoshilabs/slips/blob/master/slip-0132.md
class ExtendedPublicKey {
  private readonly rawKey: Buffer
  constructor(extendedPublicKey: string) {
    this.rawKey = bs58check.decode(extendedPublicKey).slice(4)
  }

  toXpub() {
    return this.addPrefix('0488b21e')
  }

  toYPub() {
    return this.addPrefix('049d7cb2')
  }

  toZPub() {
    return this.addPrefix('04b24746')
  }

  private addPrefix(prefix: string) {
    const data = Buffer.concat([Buffer.from(prefix, 'hex'), this.rawKey])
    return bs58check.encode(data)
  }
}

export class BitcoinSegwitProtocol extends BitcoinProtocol {
  public name = 'Bitcoin (Segwit)'
  public identifier: ProtocolSymbols = MainProtocolSymbols.BTC_SEGWIT

  public standardDerivationPath: string = `m/84'/0'/0'`
  public addressPlaceholder: string = 'bc1...'
  private readonly bip32 = BIP32Factory(ecc)

  constructor(options: BitcoinProtocolOptions = new BitcoinProtocolOptions()) {
    super(options)
  }

  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const bitcoinNode = this.bip32.fromSeed(Buffer.from(secret, 'hex'), this.options.network.extras.network)

    const neutered = bitcoinNode.derivePath(derivationPath).neutered()

    const zpub = new ExtendedPublicKey(neutered.toBase58()).toZPub()

    return zpub
  }

  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    if (!derivationPath) {
      return this.bip32.fromSeed(Buffer.from(secret, 'hex'), this.options.network.extras.network) as any
    }

    const bitcoinNode = this.bip32.fromSeed(Buffer.from(secret, 'hex'), this.options.network.extras.network)

    const privateKey = bitcoinNode.derivePath(derivationPath).privateKey

    if (!privateKey) {
      throw new Error('No privatekey!')
    }

    return Buffer.from(privateKey).toString('hex')
  }

  public async getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getExtendedPrivateKeyFromHexSecret(secret, derivationPath)
  }

  public async getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const bitcoinNode = this.bip32.fromSeed(Buffer.from(secret, 'hex'), this.options.network.extras.network)

    return bitcoinNode.derivePath(derivationPath).toBase58()
  }

  public async getAddressFromPublicKey(publicKey: string, cursor?: BitcoinAddressCursor): Promise<BitcoinAddressResult> {
    // broadcaster knows this (both broadcaster and signer)

    const address: BitcoinSegwitAddress = BitcoinSegwitAddress.fromAddress(
      this.bip32.fromBase58(publicKey, this.options.network.extras.network).toBase58()
    )

    return {
      address: address.asString(),
      cursor: { hasNext: false }
    }
  }

  public async getAddressesFromPublicKey(publicKey: string, cursor?: BitcoinAddressCursor): Promise<BitcoinAddressResult[]> {
    return [await this.getAddressFromPublicKey(publicKey, cursor)]
  }

  public async getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<BitcoinAddressResult> {
    const xpub = new ExtendedPublicKey(extendedPublicKey).toXpub()

    // broadcaster knows this (both broadcaster and signer)
    const keyPair = this.bip32
      .fromBase58(xpub, this.options.network.extras.network)
      .derive(visibilityDerivationIndex)
      .derive(addressDerivationIndex)

    const obj = bitcoinJS.payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey) })

    const { address: addressRaw } = obj

    if (!addressRaw) {
      throw new Error('could not generate address')
    }

    const address: BitcoinSegwitAddress = BitcoinSegwitAddress.fromAddress(addressRaw)

    return {
      address: address.asString(),
      cursor: { hasNext: false }
    }
  }

  public getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<BitcoinAddressResult[]> {
    // broadcaster knows this (both broadcaster and signer)
    const node = this.bip32.fromBase58(new ExtendedPublicKey(extendedPublicKey).toXpub(), this.options.network.extras.network)
    const generatorArray = Array.from(new Array(addressCount), (x, i) => i + offset)

    return Promise.all(
      generatorArray.map((x): BitcoinAddressResult => {
        const keyPair = node.derive(visibilityDerivationIndex).derive(x)

        const { address: addressRaw } = bitcoinJS.payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey) })

        if (!addressRaw) {
          throw new Error('could not generate address')
        }

        const address: BitcoinSegwitAddress = BitcoinSegwitAddress.fromAddress(addressRaw)

        return {
          address: address.asString(),
          cursor: { hasNext: false }
        }
      })
    )
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    // out of public information (both broadcaster and signer)
    const transaction = unsignedTx.transaction as RawBitcoinSegwitTransaction

    const decodedPSBT = bitcoinJS.Psbt.fromHex(transaction.psbt)

    let feeCalculator = new BigNumber(0)

    for (const txIn of decodedPSBT.data.inputs) {
      feeCalculator = feeCalculator.plus(new BigNumber(txIn.witnessUtxo?.value ?? 0))
    }

    for (const txOut of decodedPSBT.txOutputs) {
      feeCalculator = feeCalculator.minus(new BigNumber(txOut.value))
    }

    const warnings: AirGapTransactionWarning[] = []

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
                  bitcoinJS.payments.p2wpkh({
                    pubkey: el.pubkey,
                    network: bitcoinJS.networks.bitcoin
                  }).address
              )
              .join(' ') ?? 'INVALID'
        ),
        to: decodedPSBT.txOutputs.map((obj) => {
          return obj.address || `Script: ${obj.script.toString('hex')}` || 'unknown'
        }),
        amount: amount.toString(10),
        fee: feeCalculator.toString(10),
        protocolIdentifier: this.identifier,
        network: this.options.network,
        isInbound: false,
        transactionDetails: {
          // This is some unstructured data about the PSBT. This is shown in the UI as a JSON for advanced users.
          inputTx: eachRecursive(clonedPSBT.txInputs),
          outputTx: eachRecursive(clonedPSBT.txOutputs),
          inputData: clonedPSBT.data.inputs,
          outputData: clonedPSBT.data.outputs,
          PSBTVersion: clonedPSBT.version,
          PSBTLocktime: clonedPSBT.locktime,
          PSBTGlobalMap: clonedPSBT.data.globalMap,
          rawPSBT: unsignedTx.transaction
        },
        warnings
      }
    ]
  }

  public async getTransactionDetailsFromSigned(signedTx: SignedBitcoinSegwitTransaction): Promise<IAirGapTransaction[]> {
    return this.getTransactionDetails({ publicKey: '', transaction: { psbt: signedTx.transaction } })
  }

  public async prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: string[],
    fee: string,
    extras: {
      masterFingerprint: string
      replaceByFee: boolean
    }
  ): Promise<any> {
    if (!extras.masterFingerprint) {
      throw new Error('MasterFingerprint not set!')
    }

    const wrappedValues: BigNumber[] = values.map((value: string) => new BigNumber(value))
    const wrappedFee: BigNumber = new BigNumber(fee)

    const transaction: RawBitcoinTransaction = {
      ins: [],
      outs: []
    }

    if (recipients.length !== wrappedValues.length) {
      throw new Error('recipients do not match values')
    }

    const { data: utxos }: { data: UTXOResponse[] } = await axios.get<UTXOResponse[]>(
      `${this.options.network.extras.indexerApi}/api/v2/utxo/${extendedPublicKey}?confirmed=true`,
      {
        responseType: 'json'
      }
    )

    if (utxos.length <= 0) {
      throw new Error('not enough balance') // no transactions found on those addresses, probably won't find anything in the next ones
    }

    const totalRequiredBalance: BigNumber = wrappedValues
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

      const derivedAddress: string = (await this.getAddressFromExtendedPublicKey(extendedPublicKey, indexes[0], indexes[1])).address
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

    for (let i = 0; i < recipients.length; i++) {
      transaction.outs.push({
        recipient: recipients[i],
        isChange: false,
        value: wrappedValues[i].toString(10)
      })
      valueAccumulator = valueAccumulator.minus(wrappedValues[i])
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
      const derivedAddress: string = (await this.getAddressFromExtendedPublicKey(extendedPublicKey, 1, changeAddressIndex)).address
      transaction.outs.push({
        recipient: derivedAddress,
        isChange: true,
        value: changeValue.toString(10),
        derivationPath: `1/${changeAddressIndex}`
      })
    }

    const psbt = new bitcoinJS.Psbt()

    // We add the total amount of the transaction to the global map. This can be used to show the info in the "from-to" component after the transaction was signed.
    psbt.addUnknownKeyValToGlobal({
      key: Buffer.from('amount'),
      value: Buffer.from(
        wrappedValues.reduce((accumulator: BigNumber, currentValue: BigNumber) => accumulator.plus(currentValue)).toString()
      )
    })

    const keyPair = this.bip32.fromBase58(new ExtendedPublicKey(extendedPublicKey).toXpub())

    const replaceByFee: boolean = extras.replaceByFee ? true : false
    transaction.ins.forEach((tx) => {
      const indexes: [number, number] = getPathIndexes(tx.derivationPath!)

      const childNode = keyPair.derivePath(indexes.join('/'))

      const p2wpkh = bitcoinJS.payments.p2wpkh({ pubkey: Buffer.from(childNode.publicKey), network: this.options.network.extras.network })

      const p2shOutput = p2wpkh.output

      if (!p2shOutput) {
        throw new Error('no p2shOutput')
      }

      psbt.addInput({
        hash: tx.txId,
        index: tx.vout,
        sequence: replaceByFee ? 0xfffffffd : undefined, // Needs to be at least 2 below max int value to be RBF
        witnessUtxo: {
          script: p2shOutput,
          value: parseInt(tx.value)
        },
        bip32Derivation: [
          {
            masterFingerprint: Buffer.from(extras.masterFingerprint, 'hex'),
            pubkey: Buffer.from(childNode.publicKey),
            path: tx.derivationPath!
          }
        ]
      })
    })

    transaction.outs.forEach((out, index) => {
      psbt.addOutput({ address: out.recipient, value: parseInt(out.value) })
      if (out.derivationPath) {
        // We add the derivation path of our change address to the key value map of the PSBT. This will allow us to later "filter" out this address when displaying the transaction info.
        psbt.addUnknownKeyValToOutput(index, {
          key: Buffer.from('dp'),
          value: Buffer.from(out.derivationPath, 'utf8')
        })
      }
    })

    const tx: RawBitcoinSegwitTransaction = {
      psbt: psbt.toHex()
    }

    return tx
  }

  public async signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any /* RawBitcoinSegwitTransaction */): Promise<string> {
    const rawBitcoinSegwitTx: RawBitcoinSegwitTransaction = transaction

    const bip32PK = this.bip32.fromBase58(extendedPrivateKey)

    const decodedPSBT = bitcoinJS.Psbt.fromHex(rawBitcoinSegwitTx.psbt)

    decodedPSBT.data.inputs.forEach((input, index) => {
      input.bip32Derivation?.forEach((deriv) => {
        try {
          // This uses the same logic to find child key as the "findWalletByFingerprintDerivationPathAndProtocolIdentifier" method in the Vault
          const cutoffFrom = deriv.path.lastIndexOf("'") || deriv.path.lastIndexOf('h')
          const childPath = deriv.path.substr(cutoffFrom + 2)
          const childNode = bip32PK.derivePath(childPath)
          decodedPSBT.signInput(index, {
            publicKey: Buffer.from(childNode.publicKey),
            sign: (hash: Buffer, lowR?: boolean) => Buffer.from(childNode.sign(hash, lowR))
          })
          console.log(`Signed input ${index} with path ${deriv.path}`)
        } catch (e) {
          console.log(`Error signing input ${index}`, e)
        }
      })
    })

    return decodedPSBT.toHex()
  }

  public async broadcastTransaction(rawTransaction: string): Promise<string> {
    const hexTransaction = bitcoinJS.Psbt.fromHex(rawTransaction).finalizeAllInputs().extractTransaction().toHex()

    return super.broadcastTransaction(hexTransaction)
  }
}
