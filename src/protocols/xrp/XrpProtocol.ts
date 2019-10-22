import { ICoinProtocol } from '../ICoinProtocol'
import { XrpKeyPair } from '../../utils/xrp/xrpKeyPair'
import * as bitcoinJS from 'bitcoinjs-lib'
import { BigNumber } from 'bignumber.js'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { UnsignedTransaction } from '../../serializer/unsigned-transaction.serializer'
import rippleKeypairs = require('ripple-keypairs')
import { FormattedPayment } from '../../../node_modules/ripple-lib/dist/npm/transaction/types'
import { oc } from 'ts-optchain'

import { Payment } from 'ripple-lib/dist/npm/transaction/payment'
import { Instructions } from 'ripple-lib/dist/npm/transaction/types'
import { Adjustment, MaxAdjustment } from 'ripple-lib/dist/npm/common/types/objects/adjustments'
const rippleBinaryCodec = require('ripple-binary-codec')

// import {
//   FormattedOrderSpecification,
//   FormattedTrustline,
//   RippledAmount,
//   FormattedSettings
// } from '../../../node_modules/ripple-lib/dist/npm/common/types/objects'
import { RippleAPI, FormattedTransactionType } from 'ripple-lib'
import { APIOptions } from 'ripple-lib/dist/npm/api'
import { RawXrpTransaction, XrpMemo } from '../../serializer/unsigned-transactions/xrp-transactions.serializer'
import { Amount } from 'ripple-lib/dist/npm/common/types/objects'
import { SignedXrpTransaction } from '../../serializer/signed-transactions/xrp-transactions.serializer'
import { dropsToXrp } from 'ripple-lib/dist/npm/common'
import { FormattedGetAccountInfoResponse } from 'ripple-lib/dist/npm/ledger/accountinfo'

export const enum LedgerType {
  Offline,
  RealTimeLedger, // used for current transactions
  LongTermLedger // used for historical data
}

export interface XrpAdditionalData {
  memos: XrpMemo[]
  destinationTag?: number
}

export interface IRippleLedgerProvider {
  getRippleApi(ledgerType: LedgerType): RippleAPI
}

class RippleLedgerProvider implements IRippleLedgerProvider {
  getRippleApi(ledgerType: LedgerType): RippleAPI {
    var apiOptions: APIOptions | null = null

    switch (ledgerType) {
      case LedgerType.RealTimeLedger:
        apiOptions = {}
        apiOptions.server = 'wss://s1.ripple.com'
        break
      case LedgerType.LongTermLedger:
        apiOptions = {}
        apiOptions.server = 'wss://s2.ripple.com'
        break

      default:
        break
    }

    const api = new RippleAPI(apiOptions as APIOptions)

    return api
  }
}

class TransactionHistoryHolder {
  private _paginationMap = new Map<string, FormattedTransactionType[]>()

  addTransactions(address: string, transactions: FormattedTransactionType[], transactionOffset?: FormattedTransactionType) {
    let items: FormattedTransactionType[] = this._paginationMap.has(address)
      ? this._paginationMap[address]
      : new Array<FormattedTransactionType>()

    if (transactionOffset != null && items.entries.length > 0) {
      let lastTx = items[items.entries.length - 1]
      if (lastTx.id != transactionOffset.id)
        throw new Error('Could not append to saved transactions - last transaction saved is different than the offset')
    }

    let mergedTxs = items.concat(transactions)
    this._paginationMap[address] = mergedTxs
  }

  getLastTransaction(address: string): FormattedTransactionType | null {
    if (this._paginationMap.has(address)) {
      let items: [FormattedTransactionType] = this._paginationMap[address]

      if (items.entries.length < 1) return null

      return items[items.entries.length - 1]
    }

    return null
  }

  getTransactionAtIndex(address: string, index: number): FormattedTransactionType | null {
    if (this._paginationMap.has(address)) {
      let items: [FormattedTransactionType] = this._paginationMap[address]

      if (items.entries.length < index) return null

      return items[index]
    }

    return null
  }
}

export class XrpProtocol implements ICoinProtocol {
  private static ALLOWED_CHARS = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz'
  private precision = 6
  private network = bitcoinJS.networks.bitcoin

  rippleLedgerProvider: IRippleLedgerProvider = new RippleLedgerProvider()

  symbol = 'XRP'
  name = 'XRP'
  marketSymbol = 'XRP'
  feeSymbol = 'DROP  '

  feeDefaults = {
    low: new BigNumber('0.00001'),
    medium: new BigNumber('0.0001'),
    high: new BigNumber('0.001')
  }

  decimals = this.precision
  feeDecimals = this.precision
  identifier = 'XRP'

  units = [
    {
      unitSymbol: 'XRP',
      factor: new BigNumber(1)
    },
    {
      unitSymbol: 'DROP',
      factor: new BigNumber(1).shiftedBy(this.feeDecimals)
    }
  ]

  supportsHD: boolean = false
  standardDerivationPath: string = `m/44'/144'/0'/0/0`
  addressIsCaseSensitive: boolean = true
  addressValidationPattern: string = '^r[' + XrpProtocol.ALLOWED_CHARS + ']{27,35}$'
  addressPlaceholder: string = 'rHb9CJAWyB4rj9...'
  blockExplorer: string = 'https://bithomp.com/explorer/'

  getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}${address}`
  }
  getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}${txId}`
  }
  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    const xrpNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network as bitcoinJS.Network)
    return xrpNode
      .derivePath(derivationPath)
      .neutered()
      .getPublicKeyBuffer()
      .toString('hex')
  }
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    const xrpNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network as bitcoinJS.Network)
    return xrpNode.derivePath(derivationPath).keyPair.d.toBuffer(32)
  }
  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string {
    throw new Error('Method not implemented.')
  }
  async getAddressFromPublicKey(publicKey: string): Promise<string> {
    return rippleKeypairs.deriveAddress(publicKey)
  }
  async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return [address]
  }
  async getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<string> {
    return Promise.reject('getAddressFromExtendedPublicKey for XRP not implemented')
  }
  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<string[]> {
    return Promise.reject('getAddressesFromExtendedPublicKey for XRP not implemented')
  }
  async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getTransactionsFromAddresses([address], limit, offset)
  }
  getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return Promise.reject('extended public transaction list for XRP not implemented')
  }

  // Unfortunately cannot think of a better solution for now
  private _transactionHolder: TransactionHistoryHolder = new TransactionHistoryHolder()

  getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const airGapTransactions: IAirGapTransaction[] = []

    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<any>[] = []
      for (let address of addresses) {
        const api = this.rippleLedgerProvider.getRippleApi(LedgerType.LongTermLedger)

        var afterTransaction: FormattedTransactionType | null =
          offset < 1 ? null : this._transactionHolder.getTransactionAtIndex(address, offset)

        promises.push(
          new Promise((resolve, reject) => {
            api
              .getTransactions(address, {
                start: afterTransaction == null ? undefined : afterTransaction.id,
                limit: limit
              })
              .then(transactions => {
                this._transactionHolder.addTransactions(address, transactions)

                for (let transaction of transactions) {
                  const fee = new BigNumber(transaction.outcome.fee)

                  let tx = transaction.specification as FormattedPayment
                  if (tx === undefined) continue

                  let paidAmmount = transaction.outcome.deliveredAmount as {
                    currency: string
                    counterparty?: string
                    value: string
                  }
                  if (paidAmmount == null) continue

                  if (paidAmmount.currency.toUpperCase() != this.marketSymbol) continue

                  var txDateNumber: number = 0
                  let timestampDateString = transaction.outcome.timestamp as string
                  if (timestampDateString != null) txDateNumber = Date.parse(timestampDateString)

                  const airGapTransaction: IAirGapTransaction = {
                    hash: transaction.id,
                    from: [tx.source.address],
                    to: [tx.destination.address],
                    isInbound: tx.destination.address === address,
                    amount: new BigNumber(paidAmmount.value),
                    fee: fee,
                    blockHeight: transaction.outcome.indexInLedger.toString(),
                    protocolIdentifier: this.identifier,
                    timestamp: txDateNumber
                  }

                  airGapTransactions.push(airGapTransaction)
                }
              })
              .catch(reject)
          })
        )
      }
      Promise.all(promises)
        .then(values => {
          overallResolve([].concat.apply([], values))
        })
        .catch(overallReject)
    })
  }

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string> {
    return Promise.reject('signWithExtendedPrivateKey for XRP not implemented')
  }

  async signWithPrivateKey(privateKey: Buffer, transaction: RawXrpTransaction): Promise<string> {
    let api = this.rippleLedgerProvider.getRippleApi(LedgerType.Offline)

    let amount: Amount = {
      currency: 'XRP',
      value: transaction.amount.toString()
    }
    let source: MaxAdjustment = {
      address: transaction.account,
      maxAmount: amount,
      tag: undefined
    }
    let destination: Adjustment = {
      address: transaction.destination,
      amount: amount,
      tag: transaction.destinationTag
    }
    let payment: Payment = {
      source: source,
      destination: destination
    }
    const privateKeyString = privateKey.toString('hex')
    let xrpKeyPair = new XrpKeyPair(privateKeyString)
    let privateKeyHex = xrpKeyPair.toHexPrivateKey(true)
    let publicKeyHex = xrpKeyPair.toHexPubKey()
    const keyPair = { privateKey: privateKeyHex, publicKey: publicKeyHex }

    let paymentInstruction: Instructions = {
      sequence: transaction.sequence,
      fee: transaction.fee.toString(),
      maxLedgerVersion: transaction.maxLedgerVersion
    }

    let preparedPayment = await api.preparePayment(transaction.account, payment, paymentInstruction)

    let signedTransactionInfo = await api.sign(preparedPayment.txJSON, keyPair)
    let signedTx = signedTransactionInfo.signedTransaction

    return Promise.resolve(signedTx)
  }

  getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction> {
    const transaction = unsignedTx.transaction as RawXrpTransaction
    let fromAccounts: [string] = [transaction.account.toString()]
    let airGapTransaction: IAirGapTransaction = {
      from: fromAccounts,
      to: [transaction.destination],
      amount: new BigNumber(transaction.amount),
      fee: new BigNumber(transaction.fee),
      protocolIdentifier: this.identifier,
      isInbound: false,
      data: '' // TODO: transaction.data
    }
    return Promise.resolve(airGapTransaction)
  }
  async getTransactionDetailsFromSigned(xrpSignedTransaction: SignedXrpTransaction): Promise<IAirGapTransaction> {
    let txJson = rippleBinaryCodec.decode(xrpSignedTransaction.transaction)

    let airGapTx: IAirGapTransaction = {
      from: [txJson.Account],
      to: [txJson.Destination],
      amount: new BigNumber(dropsToXrp(txJson.Amount)),
      fee: new BigNumber(dropsToXrp(txJson.Fee)),
      protocolIdentifier: this.identifier,
      isInbound: false
    }

    return Promise.resolve(airGapTx)
  }
  async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    let values = await addresses.map(async address => {
      let value = await this.getAccountInfo(address).then(x => {
        return new BigNumber(x.xrpBalance)
      })
      return value
    })

    return values.reduce(async (a, b) => {
      let aBigNum = await a
      let bBigNum = await b
      return BigNumber.sum(aBigNum, bBigNum)
    })
  }
  async getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    let address = await this.getAddressFromPublicKey(publicKey)
    return this.getAccountInfo(address).then(x => {
      return new BigNumber(x.xrpBalance)
    })
  }

  private getAccountInfo(address: string): Promise<FormattedGetAccountInfoResponse> {
    let api = this.rippleLedgerProvider.getRippleApi(LedgerType.RealTimeLedger)
    return api.getAccountInfo(address)
  }

  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<BigNumber> {
    return Promise.reject('getBalanceOfExtendedPublicKey for XRP not implemented')
  }
  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    data?: any
  ): Promise<any> {
    return Promise.reject('prepareTransactionFromExtendedPublicKey for XRP not implemented')
  }

  async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    xrpFee: BigNumber,
    data?: XrpAdditionalData
  ): Promise<RawXrpTransaction> {
    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }
    let sourceAddress = await this.getAddressFromPublicKey(publicKey)
    let destinationTag = oc(data).destinationTag(undefined)

    let api = this.rippleLedgerProvider.getRippleApi(LedgerType.RealTimeLedger)

    await api.connect()
    let accountInfo = await api.getAccountInfo(sourceAddress)
    let currentLedgerVersion = await api.getLedgerVersion()
    let maxLedgerVersion = currentLedgerVersion + +100 // TODO: What max ledger offset to give :O?

    await api.disconnect()

    let totalToPay = xrpFee.plus(values[0].toNumber())
    let balance = new BigNumber(accountInfo.xrpBalance)

    if (totalToPay.comparedTo(balance) > 0) {
      return Promise.reject('total to pay ' + totalToPay + ' is greater than balance ' + balance)
    }

    const transaction: RawXrpTransaction = {
      fee: xrpFee.toNumber(),
      account: sourceAddress,
      amount: values[0].toNumber(),
      destination: recipients[0],
      destinationTag: destinationTag,
      sequence: accountInfo.sequence,
      transactionType: 'Payment',
      memos: data ? data.memos : [],
      maxLedgerVersion: maxLedgerVersion
    }
    return transaction
  }

  broadcastTransaction(rawTransaction: any): Promise<string> {
    throw new Error('Method not implemented.')
  }
}
