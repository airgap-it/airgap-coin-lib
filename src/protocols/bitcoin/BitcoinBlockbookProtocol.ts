import * as assert from 'assert'

import axios from 'axios'
import BigNumber from 'bignumber.js'
import * as bitcoinJS from 'bitcoinjs-lib'

import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { INetwork } from '../../networks'
import { SignedBitcoinTransaction } from '../../serializer/signed-transactions/bitcoin-transactions.serializer'
import { UnsignedTransaction } from '../../serializer/unsigned-transaction.serializer'
import { RawBitcoinTransaction } from '../../serializer/unsigned-transactions/bitcoin-transactions.serializer'
import { ICoinProtocol } from '../ICoinProtocol'

export interface Vin {
  txid: string
  sequence: any
  n: number
  addresses: string[]
  value: string
  hex: string
}

export interface Vout {
  value: string
  n: number
  hex: string
  addresses: string[]
  spent?: boolean
}

export interface Transaction {
  txid: string
  version: number
  vin: Vin[]
  vout: Vout[]
  blockhash: string
  blockheight: number
  confirmations: number
  blocktime: number
  value: string
  valueIn: string
  fees: string
  hex: string
}

export interface Token {
  type: string
  name: string
  path: string
  transfers: number
  decimals: number
  balance: string
  totalReceived: string
  totalSent: string
}

export interface XPubResponse {
  page: number
  totalPages: number
  itemsOnPage: number
  address: string
  balance: string
  totalReceived: string
  totalSent: string
  unconfirmedBalance: string
  unconfirmedTxs: number
  txs: number
  transactions?: Transaction[]
  totalTokens?: number
  tokens?: Token[]
}

export interface AddressResponse {
  page: number
  totalPages: number
  itemsOnPage: number
  address: string
  balance: string
  totalReceived: string
  totalSent: string
  unconfirmedBalance: string
  unconfirmedTxs: number
  txs: number
  transactions?: Transaction[]
}

const DUST_AMOUNT = 50

export class BitcoinBlockbookProtocol implements ICoinProtocol {
  symbol = 'BTC'
  name = 'Bitcoin'
  marketSymbol = 'btc'

  feeSymbol = 'btc'

  subProtocols = []

  feeDefaults = {
    low: new BigNumber('0.00002'),
    medium: new BigNumber('0.00004'),
    high: new BigNumber('0.00005')
  }
  decimals = 8
  feeDecimals = 8
  identifier = 'btc'
  units = [
    {
      unitSymbol: 'BTC',
      factor: new BigNumber(1)
    },
    {
      unitSymbol: 'mBTC',
      factor: new BigNumber(1).shiftedBy(-4)
    },
    {
      unitSymbol: 'Satoshi',
      factor: new BigNumber(1).shiftedBy(-8)
    }
  ]

  supportsHD = true

  standardDerivationPath = `m/44'/0'/0'`

  addressIsCaseSensitive = true
  addressValidationPattern = '^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$'
  addressPlaceholder = '1ABC...'

  blockExplorer = 'https://live.blockcypher.com/btc'

  network: any // TODO: fix type definition
  baseApiUrl: string
  bitcoinJSLib: any

  constructor(network: INetwork = bitcoinJS.networks.bitcoin, baseApiUrl = 'https://btc1.trezor.io', bitcoinJSLib = bitcoinJS) {
    this.network = network
    this.baseApiUrl = `https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=${baseApiUrl}`
    this.bitcoinJSLib = bitcoinJSLib
  }

  getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}/address/{{address}}/`.replace('{{address}}', address)
  }

  getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}/tx/{{txId}}/`.replace('{{txId}}', txId)
  }

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    const bitcoinNode = this.bitcoinJSLib.HDNode.fromSeedHex(secret, this.network)
    return bitcoinNode
      .derivePath(derivationPath)
      .neutered()
      .toBase58()
  }

  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    const bitcoinNode = this.bitcoinJSLib.HDNode.fromSeedHex(secret, this.network)
    return bitcoinNode.derivePath(derivationPath).keyPair.d.toBuffer(32)
  }

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string {
    const bitcoinNode = this.bitcoinJSLib.HDNode.fromSeedHex(secret, this.network)
    return bitcoinNode.derivePath(derivationPath).toBase58()
  }

  async getAddressFromPublicKey(publicKey: string): Promise<string> {
    // broadcaster knows this (both broadcaster and signer)
    return this.bitcoinJSLib.HDNode.fromBase58(publicKey, this.network).getAddress()
  }

  async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    return [await this.getAddressFromPublicKey(publicKey)]
  }

  getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex, addressDerivationIndex) {
    // broadcaster knows this (both broadcaster and signer)
    return this.bitcoinJSLib.HDNode.fromBase58(extendedPublicKey, this.network)
      .derive(visibilityDerivationIndex)
      .derive(addressDerivationIndex)
      .getAddress()
  }

  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<string[]> {
    // broadcaster knows this (both broadcaster and signer)
    const node = this.bitcoinJSLib.HDNode.fromBase58(extendedPublicKey, this.network)
    const generatorArray = Array.from(new Array(addressCount), (x, i) => i + offset)
    return Promise.all(
      generatorArray.map(x =>
        node
          .derive(visibilityDerivationIndex)
          .derive(x)
          .getAddress()
      )
    )
  }

  signWithPrivateKey(privateKey: Buffer, transaction: RawBitcoinTransaction): Promise<IAirGapSignedTransaction> {
    return new Promise((resolve, reject) => {
      const transactionBuilder = new this.bitcoinJSLib.TransactionBuilder(this.network)

      for (let input of transaction.ins) {
        transactionBuilder.addInput(input.txId, input.vout)
      }

      for (let output of transaction.outs) {
        transactionBuilder.addOutput(output.recipient, output.value.toNumber())
      }

      for (let i = 0; i < transaction.ins.length; i++) {
        transactionBuilder.sign(i, privateKey)
      }

      resolve(transactionBuilder.build().toHex())
    })
  }

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: RawBitcoinTransaction): Promise<string> {
    return new Promise((resolve, reject) => {
      const transactionBuilder = new this.bitcoinJSLib.TransactionBuilder(this.network)
      const node = this.bitcoinJSLib.HDNode.fromBase58(extendedPrivateKey, this.network)

      for (let input of transaction.ins) {
        transactionBuilder.addInput(input.txId, input.vout)
      }

      for (let output of transaction.outs) {
        transactionBuilder.addOutput(output.recipient, output.value.toNumber())
      }

      for (let i = 0; i < transaction.ins.length; i++) {
        transactionBuilder.sign(i, node.derivePath(transaction.ins[i].derivationPath))
      }

      resolve(transactionBuilder.build().toHex())
    })
  }

  async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction> {
    // out of public information (both broadcaster and signer)
    const transaction = unsignedTx.transaction as RawBitcoinTransaction

    let feeCalculator = new BigNumber(0)

    for (let txIn of transaction.ins) {
      feeCalculator = feeCalculator.plus(new BigNumber(txIn.value))
    }

    for (let txOut of transaction.outs) {
      feeCalculator = feeCalculator.minus(new BigNumber(txOut.value))
    }

    return {
      from: transaction.ins.map(obj => obj.address),
      to: transaction.outs.filter(obj => obj.isChange === false).map(obj => obj.recipient),
      amount: transaction.outs
        .filter(obj => obj.isChange === false)
        .map(obj => obj.value)
        .reduce((accumulator, currentValue) => accumulator.plus(currentValue)),
      fee: feeCalculator,
      protocolIdentifier: this.identifier,
      isInbound: false
    }
  }

  async getTransactionDetailsFromSigned(signedTx: SignedBitcoinTransaction): Promise<IAirGapTransaction> {
    let tx = {
      to: [] as string[],
      from: signedTx.from,
      amount: signedTx.amount,
      fee: signedTx.fee,
      protocolIdentifier: this.identifier,
      isInbound: false
    }

    const bitcoinTx = this.bitcoinJSLib.Transaction.fromHex(signedTx.transaction)
    bitcoinTx.outs.forEach(output => {
      let address = this.bitcoinJSLib.address.fromOutputScript(output.script, this.network)
      // only works if one output is target and rest is change, but this way we can filter out change addresses
      if (new BigNumber(output.value).isEqualTo(signedTx.amount)) {
        tx.to.push(address)
      }
    })

    return tx
  }

  async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    let valueAccumulator = new BigNumber(0)

    // The API doesn't support batch checking of balances, so we have to do it manually
    for (const address of addresses) {
      const { data } = await axios.get(`${this.baseApiUrl}/api/v2/address/${address}?details=basic`, {
        responseType: 'json'
      })

      valueAccumulator = valueAccumulator.plus(new BigNumber(data.balance))
    }

    return valueAccumulator
  }

  async getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }

  async getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number = 0): Promise<BigNumber> {
    const { data } = await axios.get(`${this.baseApiUrl}/api/v2/xpub/${extendedPublicKey}?pageSize=1`, {
      responseType: 'json'
    })

    return new BigNumber(data.balance)
  }

  async prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<RawBitcoinTransaction> {
    const transaction: RawBitcoinTransaction = {
      ins: [],
      outs: []
    }

    if (recipients.length !== values.length) {
      throw new Error('recipients do not match values')
    }

    const derivedAddresses: string[] = []
    const internalAddresses = await this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 101, offset)
    const externalAddresses = await this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 101, offset)
    derivedAddresses.push(...internalAddresses.slice(0, -1)) // we don't add the last one
    derivedAddresses.push(...externalAddresses.slice(0, -1)) // we don't add the last one to make change address possible

    const { data: utxos } = await axios.get(`${this.baseApiUrl}/api/v2/utxo/${extendedPublicKey}`, {
      responseType: 'json'
    })

    if (utxos.length <= 0) {
      throw new Error('not enough balance') // no transactions found on those addresses, probably won't find anything in the next ones
    }

    const totalRequiredBalance = values.reduce((accumulator, currentValue) => accumulator.plus(currentValue)).plus(fee)
    let valueAccumulator = new BigNumber(0)

    for (let utxo of utxos) {
      valueAccumulator = valueAccumulator.plus(utxo.value)
      if (derivedAddresses.indexOf(utxo.address) >= 0) {
        transaction.ins.push({
          txId: utxo.txid,
          value: new BigNumber(utxo.value),
          vout: utxo.vout,
          address: utxo.address,
          derivationPath:
            externalAddresses.indexOf(utxo.address) >= 0
              ? `0/${externalAddresses.indexOf(utxo.address) + offset}`
              : `1/${internalAddresses.indexOf(utxo.address) + offset}`
        })
      }

      if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
        break
      }
    }

    if (valueAccumulator.isLessThan(totalRequiredBalance)) {
      throw new Error('not enough balance')
    }

    // tx.addInput(utxo.txid, utxo.vout)
    for (let i = 0; i < recipients.length; i++) {
      transaction.outs.push({
        recipient: recipients[i],
        isChange: false,
        value: values[i]
      })
      valueAccumulator = valueAccumulator.minus(values[i])
      // tx.addOutput(recipients[i], values[i])
    }

    const { data: transactions } = await axios.get(`${this.baseApiUrl}/api/v2/utxo/${extendedPublicKey}`, {
      responseType: 'json'
    })

    let maxIndex = -1
    for (let transaction of transactions) {
      for (let vout of transaction.vout) {
        for (let address of vout.scriptPubKey.addresses) {
          maxIndex = Math.max(maxIndex, internalAddresses.indexOf(address))
        }
      }
    }

    // If the change is considered dust, the transaction will fail.
    // Dust is a variable value around 300-600 satoshis, depending on the configuration.
    // We set a low fee here to not block any transactions, but it might still fail due to "dust".
    const changeValue = valueAccumulator.minus(fee)
    if (changeValue.isGreaterThan(new BigNumber(DUST_AMOUNT))) {
      transaction.outs.push({
        recipient: internalAddresses[Math.min(maxIndex + 1, internalAddresses.length - 1)],
        isChange: true,
        value: changeValue
      })
    }
    // tx.addOutput(internalAddresses[maxIndex + 1], valueAccumulator - fee) //this is why we sliced the arrays earlier

    return transaction
  }

  async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<RawBitcoinTransaction> {
    const transaction: RawBitcoinTransaction = {
      ins: [],
      outs: []
    }

    assert(recipients.length === values.length)
    const address = await this.getAddressFromPublicKey(publicKey)

    interface UTXOResponse {
      txid: string
      vout: number
      value: string
      height: number
      confirmations: number
    }

    const { data: utxos } = await axios.get<UTXOResponse[]>(`${this.baseApiUrl}/api/v2/utxo/${address}`, { responseType: 'json' })
    const totalRequiredBalance = values.reduce((accumulator, currentValue) => accumulator.plus(currentValue)).plus(fee)

    let valueAccumulator = new BigNumber(0)
    for (let utxo of utxos) {
      valueAccumulator = valueAccumulator.plus(new BigNumber(utxo.value))
      transaction.ins.push({
        txId: utxo.txid,
        value: new BigNumber(utxo.value),
        vout: utxo.vout,
        address: address
      })

      if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
        break
      }
    }

    if (valueAccumulator.isLessThan(totalRequiredBalance)) {
      throw new Error(`not enough balance, having ${valueAccumulator.toFixed()} of ${totalRequiredBalance.toFixed()}`)
    }

    // tx.addInput(utxo.txid, utxo.vout)
    for (let i = 0; i < recipients.length; i++) {
      transaction.outs.push({
        recipient: recipients[i],
        isChange: false,
        value: values[i]
      })
      valueAccumulator = valueAccumulator.minus(values[i])
      // tx.addOutput(recipients[i], values[i])
    }

    // If the change is considered dust, the transaction will fail.
    // Dust is a variable value around 300-600 satoshis, depending on the configuration.
    // We set a low fee here to not block any transactions, but it might still fail due to "dust".
    const changeValue = valueAccumulator.minus(fee)
    if (changeValue.isGreaterThan(new BigNumber(DUST_AMOUNT))) {
      transaction.outs.push({
        recipient: address,
        isChange: true,
        value: changeValue
      })
    }

    return transaction
  }

  async broadcastTransaction(rawTransaction: string): Promise<string> {
    const { data } = await axios.post(this.baseApiUrl + '/api/v2/sendtx/', rawTransaction)
    return data.result
  }

  async getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    offset: number,
    addressOffset = 0
  ): Promise<IAirGapTransaction[]> {
    const { data }: { data: XPubResponse } = await axios.get(
      this.baseApiUrl + '/api/v2/xpub/' + extendedPublicKey + '?details=txs&tokens=used',
      {
        responseType: 'json'
      }
    )

    const ourAddresses = (data.tokens || []).filter(token => token.type === 'XPUBAddress').map(token => token.name)

    const airGapTransactions: IAirGapTransaction[] = []

    for (let transaction of data.transactions || []) {
      let tempAirGapTransactionFrom: string[] = []
      let tempAirGapTransactionTo: string[] = []
      let tempAirGapTransactionIsInbound: boolean = true

      let amount = new BigNumber(0)

      for (let vin of transaction.vin) {
        if (this.containsSome(vin.addresses, ourAddresses)) {
          tempAirGapTransactionIsInbound = false
        }
        tempAirGapTransactionFrom.push(...vin.addresses)
        amount = amount.plus(vin.value)
      }

      for (let vout of transaction.vout) {
        if (vout.addresses) {
          tempAirGapTransactionTo.push(...vout.addresses)
          // If receiving address is our address, and transaction is outbound => our change
          if (this.containsSome(vout.addresses, ourAddresses) && !tempAirGapTransactionIsInbound) {
            // remove only if related to this address
            amount = amount.minus(vout.value)
          }
          // If receiving address is not ours, and transaction isbound => senders change
          if (!this.containsSome(vout.addresses, ourAddresses) && tempAirGapTransactionIsInbound) {
            amount = amount.minus(vout.value)
          }
        }
      }

      // deduct fee from amount
      amount = amount.minus(transaction.fees)

      const airGapTransaction: IAirGapTransaction = {
        hash: transaction.txid,
        from: tempAirGapTransactionFrom,
        to: tempAirGapTransactionTo,
        isInbound: tempAirGapTransactionIsInbound,
        amount: amount,
        fee: new BigNumber(transaction.fees),
        blockHeight: transaction.blockheight.toString(),
        protocolIdentifier: this.identifier,
        timestamp: transaction.blocktime
      }

      airGapTransactions.push(airGapTransaction)
    }

    return airGapTransactions
  }

  async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return this.getTransactionsFromAddresses([await this.getAddressFromPublicKey(publicKey)], limit, offset)
  }

  async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const airGapTransactions: IAirGapTransaction[] = []

    const { data } = await axios.get<AddressResponse>(`${this.baseApiUrl}/api/v2/utxo/${addresses[0]}?details=txs`, {
      responseType: 'json'
    })

    for (let transaction of data.transactions || []) {
      let tempAirGapTransactionFrom: string[] = []
      let tempAirGapTransactionTo: string[] = []
      let tempAirGapTransactionIsInbound: boolean = true

      let amount = new BigNumber(0)

      for (let vin of transaction.vin) {
        if (this.containsSome(vin.addresses, addresses)) {
          tempAirGapTransactionIsInbound = false
        }
        tempAirGapTransactionFrom.push(...vin.addresses)
        amount = amount.plus(vin.value)
      }

      for (let vout of transaction.vout) {
        if (vout.addresses) {
          tempAirGapTransactionTo.push(...vout.addresses)
          // If receiving address is our address, and transaction is outbound => our change
          if (this.containsSome(vout.addresses, addresses) && !tempAirGapTransactionIsInbound) {
            // remove only if related to this address
            amount = amount.minus(new BigNumber(vout.value).shiftedBy(this.decimals))
          }
          // If receiving address is not ours, and transaction isbound => senders change
          if (!this.containsSome(vout.addresses, addresses) && tempAirGapTransactionIsInbound) {
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
        amount: amount,
        fee: new BigNumber(transaction.fees).shiftedBy(this.feeDecimals),
        blockHeight: transaction.blockheight.toString(),
        protocolIdentifier: this.identifier,
        timestamp: transaction.blocktime
      }

      airGapTransactions.push(airGapTransaction)
    }

    return airGapTransactions
  }

  private containsSome(needles: any[], haystack: any[]): boolean {
    for (const needle of needles) {
      if (haystack.indexOf(needle) > -1) {
        return true
      }
    }
    return false
  }
}
