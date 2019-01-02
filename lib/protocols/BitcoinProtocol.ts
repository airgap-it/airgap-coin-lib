import * as assert from 'assert'

import * as bitcoinJS from 'bitcoinjs-lib'
import axios from 'axios'
import BigNumber from 'bignumber.js'

import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import { INetwork } from '../networks'
import { ICoinProtocol } from './ICoinProtocol'
import { UnsignedTransaction } from '../serializer/unsigned-transaction.serializer'
import { RawBitcoinTransaction } from '../serializer/unsigned-transactions/bitcoin-transactions.serializer'
import { SignedBitcoinTransaction } from '../serializer/signed-transactions/bitcoin-transactions.serializer'
import { IAirGapSignedTransaction } from '../interfaces/IAirGapSignedTransaction'

export class BitcoinProtocol implements ICoinProtocol {
  symbol = 'BTC'
  name = 'Bitcoin'
  marketSymbol = 'btc'

  feeSymbol = 'btc'

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
  addressValidationPattern = '^..[13][a-km-zA-HJ-NP-Z1-9]{25,34}$'
  addressPlaceholder = '1ABC...'

  network: any // TODO: fix type definition
  baseApiUrl: string
  bitcoinJSLib: any

  constructor(network: INetwork = bitcoinJS.networks.bitcoin, baseApiUrl = 'https://insight.bitpay.com', bitcoinJSLib = bitcoinJS) {
    this.network = network
    this.baseApiUrl = baseApiUrl
    this.bitcoinJSLib = bitcoinJSLib
  }

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    const bitcoinNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)
    return bitcoinNode
      .derivePath(derivationPath)
      .neutered()
      .toBase58()
  }

  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    const bitcoinNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)
    return bitcoinNode.derivePath(derivationPath).keyPair.d.toBuffer(32)
  }

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string {
    const bitcoinNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network)
    return bitcoinNode.derivePath(derivationPath).toBase58()
  }

  getAddressFromPublicKey(publicKey: string) {
    // broadcaster knows this (both broadcaster and signer)
    return this.bitcoinJSLib.HDNode.fromBase58(publicKey, this.network).getAddress()
  }

  getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex, addressDerivationIndex) {
    // broadcaster knows this (both broadcaster and signer)
    return this.bitcoinJSLib.HDNode.fromBase58(extendedPublicKey, this.network)
      .derive(visibilityDerivationIndex)
      .derive(addressDerivationIndex)
      .getAddress()
  }

  getAddressesFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex, addressCount, offset): string[] {
    // broadcaster knows this (both broadcaster and signer)
    const node = this.bitcoinJSLib.HDNode.fromBase58(extendedPublicKey, this.network)
    const generatorArray = Array.from(new Array(addressCount), (x, i) => i + offset)
    return generatorArray.map(x =>
      node
        .derive(visibilityDerivationIndex)
        .derive(x)
        .getAddress()
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

  getTransactionDetails(unsignedTx: UnsignedTransaction): IAirGapTransaction {
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

  getTransactionDetailsFromSigned(signedTx: SignedBitcoinTransaction): IAirGapTransaction {
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

  getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      axios
        .get(this.baseApiUrl + '/api/addrs/' + addresses.join(',') + '/utxo', { responseType: 'json' })
        .then(response => {
          const utxos = response.data
          let valueAccumulator = new BigNumber(0)
          for (let utxo of utxos) {
            valueAccumulator = valueAccumulator.plus(new BigNumber(utxo.satoshis))
          }
          resolve(valueAccumulator)
        })
        .catch(reject)
    })
  }

  getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }

  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number = 0): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      const derivedAddresses: string[][] = []
      const internalAddresses = this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 20, offset)
      const externalAddresses = this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 20, offset)
      derivedAddresses.push(internalAddresses) // we don't add the last one
      derivedAddresses.push(externalAddresses) // we don't add the last one to make change address possible

      axios
        .get(this.baseApiUrl + '/api/addrs/' + derivedAddresses.join(',') + '/utxo', { responseType: 'json' })
        .then(response => {
          const utxos = response.data
          let valueAccumulator = new BigNumber(0)
          for (let utxo of utxos) {
            valueAccumulator = valueAccumulator.plus(utxo.satoshis)
          }

          axios
            .get(this.baseApiUrl + '/api/addrs/' + derivedAddresses.join(',') + '/txs?from=0&to=1', { responseType: 'json' })
            .then(response => {
              const transactions = response.data
              if (transactions.items.length > 0) {
                this.getBalanceOfExtendedPublicKey(extendedPublicKey, offset + 100)
                  .then(value => {
                    resolve(valueAccumulator.plus(value))
                  })
                  .catch(error => {
                    reject(error)
                  })
              } else {
                resolve(valueAccumulator)
              }
            })
            .catch(reject)
        })
        .catch(reject)
    })
  }

  prepareTransactionFromExtendedPublicKey(
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
      return Promise.reject('recipients do not match values')
    }

    const derivedAddresses: string[] = []
    const internalAddresses = this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 101, offset)
    const externalAddresses = this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 101, offset)
    derivedAddresses.push(...internalAddresses.slice(0, -1)) // we don't add the last one
    derivedAddresses.push(...externalAddresses.slice(0, -1)) // we don't add the last one to make change address possible

    return new Promise((resolve, reject) => {
      axios
        .get(this.baseApiUrl + '/api/addrs/' + derivedAddresses.join(',') + '/utxo', { responseType: 'json' })
        .then(response => {
          const utxos = response.data
          const totalRequiredBalance = values.reduce((accumulator, currentValue) => accumulator.plus(currentValue)).plus(fee)
          let valueAccumulator = new BigNumber(0)
          for (let utxo of utxos) {
            valueAccumulator = valueAccumulator.plus(new BigNumber(utxo.satoshis))
            if (derivedAddresses.indexOf(utxo.address) >= 0) {
              transaction.ins.push({
                txId: utxo.txid,
                value: new BigNumber(utxo.satoshis),
                vout: utxo.vout,
                address: utxo.address,
                derivationPath:
                  externalAddresses.indexOf(utxo.address) >= 0
                    ? '0/' + (externalAddresses.indexOf(utxo.address) + offset)
                    : '1/' + (internalAddresses.indexOf(utxo.address) + offset)
              })
            }
            // tx.addInput(utxo.txid, utxo.vout)
            if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
              for (let i = 0; i < recipients.length; i++) {
                transaction.outs.push({
                  recipient: recipients[i],
                  isChange: false,
                  value: values[i]
                })
                valueAccumulator = valueAccumulator.minus(values[i])
                // tx.addOutput(recipients[i], values[i])
              }
              axios
                .get(this.baseApiUrl + '/api/addrs/' + internalAddresses.join(',') + '/txs', { responseType: 'json' })
                .then(response => {
                  const transactions = response.data
                  let maxIndex = -1
                  for (let transaction of transactions.items) {
                    for (let vout of transaction.vout) {
                      for (let address of vout.scriptPubKey.addresses) {
                        maxIndex = Math.max(maxIndex, internalAddresses.indexOf(address))
                      }
                    }
                  }
                  transaction.outs.push({
                    recipient: internalAddresses[maxIndex + 1],
                    isChange: true,
                    value: valueAccumulator.minus(fee)
                  })
                  // tx.addOutput(internalAddresses[maxIndex + 1], valueAccumulator - fee) //this is why we sliced the arrays earlier
                  resolve(transaction)
                })
                .catch(reject)
              break
            }
          }
          if (valueAccumulator.isLessThan(totalRequiredBalance)) {
            axios
              .get(this.baseApiUrl + '/api/addrs/' + internalAddresses.join(',') + '/txs?from=0&to=1', { responseType: 'json' })
              .then(response => {
                const transactions = response.data
                if (transactions.items.length <= 0) {
                  return reject('not enough balance') // no transactions found on those addresses, probably won't find anything in the next ones
                }
                resolve(this.prepareTransactionFromExtendedPublicKey(extendedPublicKey, offset + 10, recipients, values, fee)) // recursion needed to navigate through HD wallet
              })
              .catch(reject)
          }
        })
        .catch(reject)
    })
  }

  prepareTransactionFromPublicKey(
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
    const address = this.getAddressFromPublicKey(publicKey)

    return new Promise((resolve, reject) => {
      axios
        .get(this.baseApiUrl + '/api/addrs/' + address + '/utxo', { responseType: 'json' })
        .then(response => {
          const utxos = response.data
          const totalRequiredBalance = values.reduce((accumulator, currentValue) => accumulator.plus(currentValue)).plus(fee)
          let valueAccumulator = new BigNumber(0)
          for (let utxo of utxos) {
            valueAccumulator = valueAccumulator.plus(new BigNumber(utxo.satoshis))
            if (address === utxo.address) {
              transaction.ins.push({
                txId: utxo.txid,
                value: new BigNumber(utxo.satoshis),
                vout: utxo.vout,
                address: utxo.address
              })
            }
            // tx.addInput(utxo.txid, utxo.vout)
            if (valueAccumulator.isGreaterThanOrEqualTo(totalRequiredBalance)) {
              for (let i = 0; i < recipients.length; i++) {
                transaction.outs.push({
                  recipient: recipients[i],
                  isChange: false,
                  value: values[i]
                })
                valueAccumulator = valueAccumulator.minus(values[i])
                // tx.addOutput(recipients[i], values[i])
              }

              transaction.outs.push({
                recipient: address,
                isChange: true,
                value: valueAccumulator.minus(fee)
              })
              resolve(transaction)
            } else {
              reject(`Not enough Balance, having ${valueAccumulator.toFixed()} of ${totalRequiredBalance.toFixed()}`)
            }
          }
        })
        .catch(reject)
    })
  }

  broadcastTransaction(rawTransaction: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let params = new URLSearchParams() // Fix for axios content-type
      params.append('rawtx', rawTransaction)
      axios
        .post(this.baseApiUrl + '/api/tx/send', params)
        .then(response => {
          const payload = response.data
          resolve(payload.txid)
        })
        .catch(reject)
    })
  }

  async getTransactionsFromExtendedPublicKey(
    extendedPublicKey: string,
    limit: number,
    offset: number,
    addressOffset = 0
  ): Promise<IAirGapTransaction[]> {
    const derivedAddresses: string[] = []
    derivedAddresses.push(...this.getAddressesFromExtendedPublicKey(extendedPublicKey, 1, 100, addressOffset))
    derivedAddresses.push(...this.getAddressesFromExtendedPublicKey(extendedPublicKey, 0, 100, addressOffset))

    return this.getTransactionsFromAddresses(derivedAddresses, limit, offset)
  }

  getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return this.getTransactionsFromAddresses([this.getAddressFromPublicKey(publicKey)], limit, offset)
  }

  getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return new Promise((resolve, reject) => {
      const airGapTransactions: IAirGapTransaction[] = []
      axios
        .get(this.baseApiUrl + '/api/addrs/' + addresses.join(',') + '/txs?from=' + offset + '&to=' + (offset + limit), {
          responseType: 'json'
        })
        .then(response => {
          const transactions = response.data
          for (let transaction of transactions.items) {
            let tempAirGapTransactionFrom: string[] = []
            let tempAirGapTransactionTo: string[] = []
            let tempAirGapTransactionIsInbound: boolean = true

            let amount = new BigNumber(0)

            for (let vin of transaction.vin) {
              if (addresses.indexOf(vin.addr) > -1) {
                tempAirGapTransactionIsInbound = false
              }
              tempAirGapTransactionFrom.push(vin.addr)
              amount = amount.plus(vin.valueSat)
            }

            for (let vout of transaction.vout) {
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
              amount: amount,
              fee: new BigNumber(transaction.fees).shiftedBy(this.feeDecimals),
              blockHeight: transaction.blockheight,
              protocolIdentifier: this.identifier,
              timestamp: transaction.time
            }

            airGapTransactions.push(airGapTransaction)
          }
          resolve(airGapTransactions)
        })
        .catch(reject)
    })
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
