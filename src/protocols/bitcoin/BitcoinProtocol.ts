import { BitcoinTransactionCursor, BitcoinTransactionResult } from './BitcoinTypes'

import * as bitcoinJSMessage from '../../dependencies/src/bitcoinjs-message-2.1.1/index'
import axios from '../../dependencies/src/axios-0.19.0/index'
import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { mnemonicToSeed } from '../../dependencies/src/bip39-2.5.0/index'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { AirGapTransactionStatus, IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { UnsignedTransaction } from '../../serializer/schemas/definitions/transaction-sign-request'
import { SignedBitcoinTransaction } from '../../serializer/schemas/definitions/transaction-sign-response-bitcoin'
import { RawBitcoinTransaction } from '../../serializer/types'
import { MainProtocolSymbols, ProtocolSymbols } from '../../utils/ProtocolSymbols'
import { CurrencyUnit, FeeDefaults, ICoinProtocol } from '../ICoinProtocol'

import { BitcoinCryptoClient } from './BitcoinCryptoClient'
import { BitcoinProtocolOptions } from './BitcoinProtocolOptions'

const DUST_AMOUNT: number = 50

export class BitcoinProtocol implements ICoinProtocol {
  public symbol: string = 'BTC'
  public name: string = 'Bitcoin'
  public marketSymbol: string = 'btc'

  public feeSymbol: string = 'btc'

  public subProtocols = []

  public feeDefaults: FeeDefaults = {
    low: '0.00002',
    medium: '0.00004',
    high: '0.00005'
  }
  public decimals: number = 8
  public feeDecimals: number = 8
  public identifier: ProtocolSymbols = MainProtocolSymbols.BTC
  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'BTC',
      factor: '1'
    },
    {
      unitSymbol: 'mBTC',
      factor: '0.0001'
    },
    {
      unitSymbol: 'Satoshi',
      factor: '0.00000001'
    }
  ]

  public supportsHD: boolean = true

  public standardDerivationPath: string = `m/44'/0'/0'`

  public addressIsCaseSensitive: boolean = true
  public addressValidationPattern: string = '^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$'
  public addressPlaceholder: string = '1ABC...'

  private readonly feeEstimationUrl = `https://blockstream.info/api/fee-estimates`

  constructor(public readonly options: BitcoinProtocolOptions = new BitcoinProtocolOptions()) {}

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return this.options.network.blockExplorer.getAddressLink(address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return this.options.network.blockExplorer.getTransactionLink(txId)
  }

  public getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getPublicKeyFromHexSecret(secret, derivationPath)
  }

  public getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<Buffer> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getPrivateKeyFromHexSecret(secret, derivationPath)
  }

  public getExtendedPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getExtendedPrivateKeyFromHexSecret(secret, derivationPath)
  }

  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const bitcoinNode = this.options.config.bitcoinJSLib.HDNode.fromSeedHex(secret, this.options.network.extras.network)

    return bitcoinNode.derivePath(derivationPath).neutered().toBase58()
  }

  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<Buffer> {
    const bitcoinNode = this.options.config.bitcoinJSLib.HDNode.fromSeedHex(secret, this.options.network.extras.network)

    return bitcoinNode.derivePath(derivationPath).keyPair.d.toBuffer(32)
  }

  public async getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    const bitcoinNode = this.options.config.bitcoinJSLib.HDNode.fromSeedHex(secret, this.options.network.extras.network)

    return bitcoinNode.derivePath(derivationPath).toBase58()
  }

  public async getAddressFromPublicKey(publicKey: string): Promise<string> {
    // broadcaster knows this (both broadcaster and signer)
    return this.options.config.bitcoinJSLib.HDNode.fromBase58(publicKey, this.options.network.extras.network).getAddress()
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    return [await this.getAddressFromPublicKey(publicKey)]
  }

  public getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex, addressDerivationIndex) {
    // broadcaster knows this (both broadcaster and signer)
    return this.options.config.bitcoinJSLib.HDNode.fromBase58(extendedPublicKey, this.options.network.extras.network)
      .derive(visibilityDerivationIndex)
      .derive(addressDerivationIndex)
      .getAddress()
  }

  public getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<string[]> {
    // broadcaster knows this (both broadcaster and signer)
    const node = this.options.config.bitcoinJSLib.HDNode.fromBase58(extendedPublicKey, this.options.network.extras.network)
    const generatorArray = Array.from(new Array(addressCount), (x, i) => i + offset)

    return Promise.all(generatorArray.map((x) => node.derive(visibilityDerivationIndex).derive(x).getAddress()))
  }

  public async signWithPrivateKey(privateKey: Buffer, transaction: RawBitcoinTransaction): Promise<IAirGapSignedTransaction> {
    const transactionBuilder = new this.options.config.bitcoinJSLib.TransactionBuilder(this.options.network.extras.network)

    for (const input of transaction.ins) {
      transactionBuilder.addInput(input.txId, input.vout)
    }

    for (const output of transaction.outs) {
      if (output.isChange) {
        const generatedChangeAddress: string = await this.getAddressFromPublicKey(privateKey.toString('hex'))
        if (generatedChangeAddress !== output.recipient) {
          throw new Error('Change address could not be verified.')
        }
      }

      transactionBuilder.addOutput(output.recipient, new BigNumber(output.value).toNumber())
    }

    for (let i = 0; i < transaction.ins.length; i++) {
      transactionBuilder.sign(i, privateKey)
    }

    return transactionBuilder.build().toHex()
  }

  public async signWithExtendedPrivateKey(
    extendedPrivateKey: string,
    transaction: RawBitcoinTransaction,
    verifyChangeAddress: boolean = true
  ): Promise<string> {
    const transactionBuilder = new this.options.config.bitcoinJSLib.TransactionBuilder(this.options.network.extras.network)
    const node = this.options.config.bitcoinJSLib.HDNode.fromBase58(extendedPrivateKey, this.options.network.extras.network)

    for (const input of transaction.ins) {
      transactionBuilder.addInput(input.txId, input.vout)
    }

    const changeAddressBatchSize: number = 10
    const changeAddressMaxAddresses: number = 500

    for (const output of transaction.outs) {
      let changeAddressIsValid: boolean = false
      if (output.isChange && verifyChangeAddress) {
        if (output.derivationPath) {
          const generatedChangeAddress: string[] = await this.getAddressesFromExtendedPublicKey(
            extendedPrivateKey,
            1,
            1,
            parseInt(output.derivationPath, 10)
          )
          changeAddressIsValid = generatedChangeAddress.includes(output.recipient)
        } else {
          for (let x = 0; x < changeAddressMaxAddresses; x += changeAddressBatchSize) {
            const addresses: string[] = await this.getAddressesFromExtendedPublicKey(extendedPrivateKey, 1, changeAddressBatchSize, x)
            if (addresses.indexOf(output.recipient) >= 0) {
              changeAddressIsValid = true
              x = changeAddressMaxAddresses
            }
          }
        }
        if (!changeAddressIsValid) {
          throw new Error('Change address could not be verified.')
        }
      }
      transactionBuilder.addOutput(output.recipient, new BigNumber(output.value).toNumber())
    }

    for (let i = 0; i < transaction.ins.length; i++) {
      transactionBuilder.sign(i, node.derivePath(transaction.ins[i].derivationPath))
    }

    return transactionBuilder.build().toHex()
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    // out of public information (both broadcaster and signer)
    const transaction = unsignedTx.transaction as RawBitcoinTransaction

    let feeCalculator = new BigNumber(0)

    for (const txIn of transaction.ins) {
      feeCalculator = feeCalculator.plus(new BigNumber(txIn.value))
    }

    for (const txOut of transaction.outs) {
      feeCalculator = feeCalculator.minus(new BigNumber(txOut.value))
    }

    return [
      {
        from: transaction.ins.map((obj) => obj.address),
        to: transaction.outs.filter((obj) => !obj.isChange).map((obj) => obj.recipient),
        amount: transaction.outs
          .filter((obj) => !obj.isChange)
          .map((obj) => new BigNumber(obj.value))
          .reduce((accumulator, currentValue) => accumulator.plus(currentValue))
          .toString(10),
        fee: feeCalculator.toString(10),
        protocolIdentifier: this.identifier,
        network: this.options.network,
        isInbound: false,
        transactionDetails: unsignedTx.transaction
      }
    ]
  }

  public async getTransactionDetailsFromSigned(signedTx: SignedBitcoinTransaction): Promise<IAirGapTransaction[]> {
    const tx: IAirGapTransaction = {
      to: [] as string[],
      from: signedTx.from,
      amount: signedTx.amount,
      fee: signedTx.fee,
      protocolIdentifier: this.identifier,
      network: this.options.network,
      isInbound: false,
      transactionDetails: signedTx.transaction
    }

    const bitcoinTx = this.options.config.bitcoinJSLib.Transaction.fromHex(signedTx.transaction)
    bitcoinTx.outs.forEach((output) => {
      const address = this.options.config.bitcoinJSLib.address.fromOutputScript(output.script, this.options.network.extras.network)
      // only works if one output is target and rest is change, but this way we can filter out change addresses
      if (new BigNumber(output.value).isEqualTo(signedTx.amount)) {
        tx.to.push(address)
      }
    })

    return [tx]
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<string> {
    const response = await axios.get(`${this.options.network.extras.indexerApi}/api/addrs/${addresses.join(',')}/utxo`, {
      responseType: 'json'
    })

    const utxos = response.data
    let valueAccumulator: BigNumber = new BigNumber(0)
    for (const utxo of utxos) {
      valueAccumulator = valueAccumulator.plus(new BigNumber(utxo.satoshis))
    }

    return valueAccumulator.toString(10)
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<string> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address])
  }

  public async getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number = 0): Promise<string> {
    const derivedAddresses: string[][] = []
    const internalAddresses = await this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 20, offset)
    const externalAddresses = await this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 20, offset)
    derivedAddresses.push(internalAddresses) // we don't add the last one
    derivedAddresses.push(externalAddresses) // we don't add the last one to make change address possible

    const { data: utxos } = await axios.get(this.options.network.extras.indexerApi + '/api/addrs/' + derivedAddresses.join(',') + '/utxo', {
      responseType: 'json'
    })

    let valueAccumulator: BigNumber = new BigNumber(0)
    for (const utxo of utxos) {
      valueAccumulator = valueAccumulator.plus(utxo.satoshis)
    }

    const { data: transactions } = await axios.get(
      this.options.network.extras.indexerApi + '/api/addrs/' + derivedAddresses.join(',') + '/txs?from=0&to=1',
      {
        responseType: 'json'
      }
    )

    if (transactions.items.length > 0) {
      const value = await this.getBalanceOfExtendedPublicKey(extendedPublicKey, offset + 100)

      return valueAccumulator.plus(value).toString(10)
    } else {
      return valueAccumulator.toString(10)
    }
  }

  public async getAvailableBalanceOfAddresses(addresses: string[]): Promise<string> {
    return this.getBalanceOfAddresses(addresses)
  }

  public async estimateMaxTransactionValueFromExtendedPublicKey(
    extendedPublicKey: string,
    recipients: string[],
    fee?: string
  ): Promise<string> {
    return this.getBalanceOfExtendedPublicKey(extendedPublicKey)
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string> {
    return this.getBalanceOfPublicKey(publicKey)
  }

  public async estimateFeeDefaultsFromExtendedPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    const estimatedFees = (await axios.get(this.feeEstimationUrl)).data
    const transation = await this.prepareTransactionFromExtendedPublicKey(publicKey, 0, recipients, values, '0')
    const fakeSignedLength =
      (
        await this.signWithExtendedPrivateKey(
          'xprv9y52jGU1NsKDGq7cHcQjBeVC4sYff3jEzNywXk37wxUbMpsNg1RFDrBCZSZQD3nb79jpMDEdadtWgoPrZgr1SUriLUie3SVvVRKZDNfQKNv',
          transation,
          false
        )
      ).length / 2
    const bnTransactionLength = new BigNumber(fakeSignedLength)
    const mediumFee = new BigNumber(estimatedFees['6']).times(bnTransactionLength).integerValue()
    const lowFee = new BigNumber(estimatedFees['12']).times(bnTransactionLength).integerValue()
    const highFee = new BigNumber(estimatedFees['1']).times(bnTransactionLength).integerValue()

    return {
      low: lowFee.shiftedBy(-this.feeDecimals).toFixed(),
      medium: mediumFee.integerValue(BigNumber.ROUND_FLOOR).shiftedBy(-this.feeDecimals).toFixed(),
      high: highFee.shiftedBy(-this.feeDecimals).toFixed()
    }
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    data?: any
  ): Promise<FeeDefaults> {
    return Promise.reject('estimating fee defaults using non extended public key not implemented')
  }

  public async prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: string[],
    fee: string
  ): Promise<RawBitcoinTransaction> {
    const wrappedValues: BigNumber[] = values.map((value: string) => new BigNumber(value))
    const wrappedFee: BigNumber = new BigNumber(fee)

    const transaction: RawBitcoinTransaction = {
      ins: [],
      outs: []
    }

    if (recipients.length !== wrappedValues.length) {
      throw new Error('recipients do not match values')
    }

    const derivedAddresses: string[] = []
    const internalAddresses = await this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 101, offset)
    const externalAddresses = await this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 101, offset)
    derivedAddresses.push(...internalAddresses.slice(0, -1)) // we don't add the last one
    derivedAddresses.push(...externalAddresses.slice(0, -1)) // we don't add the last one to make change address possible

    const { data: utxos } = await axios.get(this.options.network.extras.indexerApi + '/api/addrs/' + derivedAddresses.join(',') + '/utxo', {
      responseType: 'json'
    })

    const totalRequiredBalance: BigNumber = wrappedValues
      .reduce((accumulator: BigNumber, currentValue: BigNumber) => accumulator.plus(currentValue))
      .plus(wrappedFee)
    let valueAccumulator: BigNumber = new BigNumber(0)

    for (const utxo of utxos) {
      valueAccumulator = valueAccumulator.plus(new BigNumber(utxo.satoshis))
      if (derivedAddresses.indexOf(utxo.address) >= 0) {
        transaction.ins.push({
          txId: utxo.txid,
          value: new BigNumber(utxo.satoshis).toString(10),
          vout: utxo.vout,
          address: utxo.address,
          derivationPath:
            externalAddresses.indexOf(utxo.address) >= 0
              ? '0/' + (externalAddresses.indexOf(utxo.address) + offset)
              : '1/' + (internalAddresses.indexOf(utxo.address) + offset)
        })
      }

      if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
        break
      }
    }

    if (valueAccumulator.isLessThan(totalRequiredBalance)) {
      const { data: transactions } = await axios.get(
        this.options.network.extras.indexerApi + '/api/addrs/' + internalAddresses.join(',') + '/txs?from=0&to=1',
        {
          responseType: 'json'
        }
      )
      if (transactions.items.length <= 0) {
        throw new Error('not enough balance') // no transactions found on those addresses, probably won't find anything in the next ones
      }

      return this.prepareTransactionFromExtendedPublicKey(extendedPublicKey, offset + 10, recipients, values, fee) // recursion needed to navigate through HD wallet
    }

    // tx.addInput(utxo.txid, utxo.vout)
    for (let i: number = 0; i < recipients.length; i++) {
      transaction.outs.push({
        recipient: recipients[i],
        isChange: false,
        value: wrappedValues[i].toString(10),
        derivationPath: '' // TODO: Remove this as soon as our serializer supports optional properties
      })
      valueAccumulator = valueAccumulator.minus(wrappedValues[i])
      // tx.addOutput(recipients[i], values[i])
    }

    const { data: transactions } = await axios.get(
      this.options.network.extras.indexerApi + '/api/addrs/' + internalAddresses.join(',') + '/txs',
      {
        responseType: 'json'
      }
    )

    let maxIndex: number = -1
    for (const item of transactions.items) {
      for (const vout of item.vout) {
        for (const address of vout.scriptPubKey.addresses) {
          maxIndex = Math.max(maxIndex, internalAddresses.indexOf(address))
        }
      }
    }

    // If the change is considered dust, the transaction will fail.
    // Dust is a variable value around 300-600 satoshis, depending on the configuration.
    // We set a low fee here to not block any transactions, but it might still fail due to "dust".
    const changeValue: BigNumber = valueAccumulator.minus(wrappedFee)
    if (changeValue.isGreaterThan(new BigNumber(DUST_AMOUNT))) {
      const internalAddressIndex: number = Math.min(maxIndex + 1, internalAddresses.length - 1)
      transaction.outs.push({
        recipient: internalAddresses[internalAddressIndex],
        isChange: true,
        value: changeValue.toString(10),
        derivationPath: (internalAddressIndex + offset).toString()
      })
    }
    // tx.addOutput(internalAddresses[maxIndex + 1], valueAccumulator - fee) //this is why we sliced the arrays earlier

    return transaction
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string
  ): Promise<RawBitcoinTransaction> {
    const wrappedValues: BigNumber[] = values.map((value: string) => new BigNumber(value))
    const wrappedFee: BigNumber = new BigNumber(fee)

    const transaction: RawBitcoinTransaction = {
      ins: [],
      outs: []
    }

    if (recipients.length !== wrappedValues.length) {
      throw new Error('Recipient and value length does not match.')
    }
    const address = await this.getAddressFromPublicKey(publicKey)

    const { data: utxos } = await axios.get(this.options.network.extras.indexerApi + '/api/addrs/' + address + '/utxo', {
      responseType: 'json'
    })
    const totalRequiredBalance: BigNumber = wrappedValues
      .reduce((accumulator: BigNumber, currentValue: BigNumber) => accumulator.plus(currentValue))
      .plus(wrappedFee)
    let valueAccumulator: BigNumber = new BigNumber(0)
    for (const utxo of utxos) {
      valueAccumulator = valueAccumulator.plus(new BigNumber(utxo.satoshis))
      if (address === utxo.address) {
        transaction.ins.push({
          txId: utxo.txid,
          value: new BigNumber(utxo.satoshis).toString(10),
          vout: utxo.vout,
          address: utxo.address
        })
      }

      if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
        break
      }
    }

    if (valueAccumulator.isLessThan(totalRequiredBalance)) {
      throw new Error(`not enough balance, having ${valueAccumulator.toFixed()} of ${totalRequiredBalance.toFixed()}`)
    }

    // tx.addInput(utxo.txid, utxo.vout)
    for (let i: number = 0; i < recipients.length; i++) {
      transaction.outs.push({
        recipient: recipients[i],
        isChange: false,
        value: wrappedValues[i].toString(10)
      })
      valueAccumulator = valueAccumulator.minus(wrappedValues[i])
      // tx.addOutput(recipients[i], values[i])
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

  public broadcastTransaction(rawTransaction: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams() // Fix for axios content-type
      params.append('rawtx', rawTransaction)
      axios
        .post(this.options.network.extras.indexerApi + '/api/tx/send', params)
        .then((response) => {
          const payload = response.data
          resolve(payload.txid)
        })
        .catch(reject)
    })
  }

  public async getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    cursor?: BitcoinTransactionCursor,
    addressOffset = 0
  ): Promise<BitcoinTransactionResult> {
    const derivedAddresses: string[] = []
    derivedAddresses.push(...(await this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 100, addressOffset)))
    derivedAddresses.push(...(await this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 100, addressOffset)))

    return this.getTransactionsFromAddresses(derivedAddresses, limit, cursor)
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<BitcoinTransactionResult> {
    return this.getTransactionsFromAddresses([await this.getAddressFromPublicKey(publicKey)], limit, cursor)
  }

  public async getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: BitcoinTransactionCursor
  ): Promise<BitcoinTransactionResult> {
    const airGapTransactions: IAirGapTransaction[] = []
    const url = cursor
      ? this.options.network.extras.indexerApi +
        '/api/addrs/' +
        addresses.join(',') +
        '/txs?from=' +
        cursor.offset +
        '&to=' +
        (cursor.offset + limit)
      : this.options.network.extras.indexerApi + '/api/addrs/' + addresses.join(',') + '/txs?from=0&to=' + limit
    const { data: transactions } = await axios.get(url, {
      responseType: 'json'
    })

    for (const transaction of transactions.items) {
      const tempAirGapTransactionFrom: string[] = []
      const tempAirGapTransactionTo: string[] = []
      let tempAirGapTransactionIsInbound: boolean = true

      let amount = new BigNumber(0)

      for (const vin of transaction.vin) {
        if (addresses.indexOf(vin.addr) > -1) {
          tempAirGapTransactionIsInbound = false
        }
        tempAirGapTransactionFrom.push(vin.addr)
        amount = amount.plus(vin.valueSat)
      }

      for (const vout of transaction.vout) {
        if (vout.scriptPubKey.addresses) {
          tempAirGapTransactionTo.push(...vout.scriptPubKey.addresses)
          // If receiving address is our address, and transaction is outbound => our change
          if (this.containsSome(vout.scriptPubKey.addresses, addresses) && !tempAirGapTransactionIsInbound) {
            // remove only if related to this address
            amount = amount.minus(new BigNumber(vout.value).shiftedBy(this.decimals))
          }
          // If receiving address is not ours, and transaction isbound => senders change
          if (!this.containsSome(vout.scriptPubKey.addresses, addresses) && tempAirGapTransactionIsInbound) {
            amount = amount.minus(new BigNumber(vout.value).shiftedBy(this.decimals))
          }
        }
      }

      // deduct fee from amount
      amount = amount.minus(new BigNumber(transaction.fees).shiftedBy(this.feeDecimals))

      const airGapTransaction: IAirGapTransaction = {
        hash: transaction.txid,
        from: tempAirGapTransactionFrom,
        to: tempAirGapTransactionTo,
        isInbound: tempAirGapTransactionIsInbound,
        amount: amount.toString(10),
        fee: new BigNumber(transaction.fees).shiftedBy(this.feeDecimals).toString(10),
        blockHeight: transaction.blockheight,
        protocolIdentifier: this.identifier,
        network: this.options.network,
        timestamp: transaction.time
      }

      airGapTransactions.push(airGapTransaction)
    }

    return { transactions: airGapTransactions, cursor: cursor ? { offset: cursor.offset + limit } : { offset: limit } }
  }

  private containsSome(needles: any[], haystack: any[]): boolean {
    for (const needle of needles) {
      if (haystack.indexOf(needle) > -1) {
        return true
      }
    }

    return false
  }

  public async signMessage(message: string, keypair: { privateKey: Buffer }): Promise<string> {
    return new BitcoinCryptoClient(this, bitcoinJSMessage).signMessage(message, keypair)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return new BitcoinCryptoClient(this, bitcoinJSMessage).verifyMessage(message, signature, publicKey)
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    return Promise.reject('Transaction status not implemented')
  }
}
