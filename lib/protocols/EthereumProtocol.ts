import { ICoinProtocol } from './ICoinProtocol'
import { INetwork } from '../networks'

import * as bitcoinJS from 'bitcoinjs-lib'
import { BigNumber } from 'bignumber.js'
import * as ethUtil from 'ethereumjs-util'
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import axios from 'axios'
import { RawEthereumTransaction } from '../serializer/unsigned-transactions/ethereum-transactions.serializer'
import * as Web3 from 'web3'
import { UnsignedTransaction } from '../serializer/unsigned-transaction.serializer'
import { SignedEthereumTransaction } from '../serializer/signed-transactions/ethereum-transactions.serializer'

const EthereumTransaction = require('ethereumjs-tx')

export class EthereumProtocol implements ICoinProtocol {
  symbol = 'ETH'
  name = 'Ethereum'
  marketSymbol = 'eth'

  feeSymbol = 'eth'

  feeDefaults = {
    low: new BigNumber('0.00021'), // 21000 Gas * 2 Gwei
    medium: new BigNumber('0.000315'), // 21000 Gas * 15 Gwei
    high: new BigNumber('0.00084') // 21000 Gas * 40 Gwei
  }

  decimals = 18
  feeDecimals = 18
  identifier = 'eth'

  units = [
    {
      unitSymbol: 'ETH',
      factor: new BigNumber(1)
    },
    {
      unitSymbol: 'GWEI',
      factor: new BigNumber(1).shiftedBy(-9)
    },
    {
      unitSymbol: 'WEI',
      factor: new BigNumber(1).shiftedBy(-18)
    }
  ]

  supportsHD = false
  standardDerivationPath = `m/44'/60'/0'/0/0`
  addressValidationPattern = '^0x[a-fA-F0-9]{40}$'
  addressPlaceholder = '0xabc...'

  web3: any
  network: INetwork
  chainId: number
  infoAPI: string

  constructor(public jsonRPCAPI = 'https://mainnet.infura.io/', infoAPI = 'https://api.trustwalletapp.com/', chainId = 1) {
    this.infoAPI = infoAPI
    this.web3 = new Web3(new Web3.providers.HttpProvider(jsonRPCAPI))
    this.network = bitcoinJS.networks.bitcoin
    this.chainId = chainId
  }

  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network as bitcoinJS.Network)
    return ethereumNode
      .derivePath(derivationPath)
      .neutered()
      .getPublicKeyBuffer()
      .toString('hex')
  }

  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network as bitcoinJS.Network)
    return ethereumNode.derivePath(derivationPath).keyPair.d.toBuffer(32)
  }

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string {
    throw new Error('extended private key support for ether not implemented')
  }

  getAddressFromPublicKey(publicKey: string | Buffer): string {
    if (typeof publicKey === 'string') {
      return ethUtil.toChecksumAddress((ethUtil.pubToAddress(Buffer.from(publicKey, 'hex'), true) as Buffer).toString('hex'))
    } else {
      return ethUtil.toChecksumAddress((ethUtil.pubToAddress(publicKey, true) as Buffer).toString('hex'))
    }
  }

  getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressDerivationIndex: number): string {
    return this.getAddressFromPublicKey(
      bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network as bitcoinJS.Network)
        .derive(visibilityDerivationIndex)
        .derive(addressDerivationIndex)
        .getPublicKeyBuffer()
        .toString('hex')
    )
  }

  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): string[] {
    const node = bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network as bitcoinJS.Network)
    const generatorArray = [addressCount].map((x, i) => i + offset)
    return generatorArray.map(x =>
      this.getAddressFromPublicKey(
        node
          .derive(visibilityDerivationIndex)
          .derive(x)
          .getPublicKeyBuffer()
          .toString('hex')
      )
    )
  }

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: RawEthereumTransaction): Promise<string> {
    return Promise.reject('extended private key signing for ether not implemented')
  }

  signWithPrivateKey(privateKey: Buffer, transaction: RawEthereumTransaction): Promise<string> {
    const tx = new EthereumTransaction(transaction)
    tx.sign(privateKey)
    return Promise.resolve(tx.serialize().toString('hex'))
  }

  getTransactionDetails(unsignedTx: UnsignedTransaction): IAirGapTransaction {
    const transaction = unsignedTx.transaction as RawEthereumTransaction
    return {
      from: [this.getAddressFromPublicKey(unsignedTx.publicKey)],
      to: [transaction.to],
      amount: new BigNumber(transaction.value),
      fee: new BigNumber(transaction.gasLimit).multipliedBy(new BigNumber(transaction.gasPrice)),
      protocolIdentifier: this.identifier,
      isInbound: false
    }
  }

  getTransactionDetailsFromSigned(transaction: SignedEthereumTransaction): IAirGapTransaction {
    const ethTx = new EthereumTransaction(transaction.transaction)

    let hexValue = ethTx.value.toString('hex') || '0x0'
    let hexGasPrice = ethTx.gasPrice.toString('hex') || '0x0'
    let hexGasLimit = ethTx.gasLimit.toString('hex') || '0x0'
    let hexNonce = ethTx.nonce.toString('hex') || '0x0'

    return {
      from: [ethUtil.toChecksumAddress('0x' + ethTx.from.toString('hex'))],
      to: [ethUtil.toChecksumAddress('0x' + ethTx.to.toString('hex'))],
      amount: new BigNumber(parseInt(hexValue, 16)),
      fee: new BigNumber(parseInt(hexGasLimit, 16)).multipliedBy(new BigNumber(parseInt(hexGasPrice, 16))),
      protocolIdentifier: this.identifier,
      isInbound: ethTx.toCreationAddress(),
      hash: ethTx.hash,
      meta: {
        nonce: parseInt(hexNonce, 16)
      },
      data: '0x' + ethTx.data.toString('hex')
    }
  }

  getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }

  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number = 0): Promise<BigNumber> {
    return Promise.reject('extended public balance for ether not implemented')
  }

  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<RawEthereumTransaction> {
    return Promise.reject('extended public tx for ether not implemented')
  }

  prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<RawEthereumTransaction> {
    const address = this.getAddressFromPublicKey(publicKey)

    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }

    return new Promise((resolve, reject) => {
      this.getBalanceOfPublicKey(publicKey)
        .then(balance => {
          const gasLimit = new BigNumber(21000)
          const gasPrice = fee.div(gasLimit).integerValue(BigNumber.ROUND_CEIL)
          if (new BigNumber(balance).gte(new BigNumber(values[0].plus(fee)))) {
            this.web3.eth.getTransactionCount(address).then(txCount => {
              const transaction: RawEthereumTransaction = {
                nonce: this.web3.utils.toHex(txCount),
                gasLimit: this.web3.utils.toHex(gasLimit),
                gasPrice: this.web3.utils.toHex(gasPrice.toFixed()), // 10 Gwei
                to: recipients[0],
                value: this.web3.utils.toHex(values[0].toFixed()),
                chainId: this.chainId,
                data: '0x'
              }

              resolve(transaction)
            })
          } else {
            reject('not enough balance')
          }
        })
        .catch(reject)
    })
  }

  broadcastTransaction(rawTransaction: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.web3.eth
        .sendSignedTransaction('0x' + rawTransaction)
        .then(receipt => {
          resolve(receipt.transactionHash)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return Promise.reject('extended public transaction list for ether not implemented')
  }

  getTransactionsFromPublicKey(publicKey: string, limit: number = 50, offset: number = 0): Promise<IAirGapTransaction[]> {
    const address = this.getAddressFromPublicKey(publicKey)
    return this.getTransactionsFromAddresses([address], limit, offset)
  }

  getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    const promises: Promise<any>[] = []
    for (let address of addresses) {
      promises.push(this.web3.eth.getBalance(address))
    }
    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(values => {
          resolve(values.map(obj => new BigNumber(obj)).reduce((a, b) => a.plus(b)))
        })
        .catch(reject)
    })
  }

  private getPageNumber(limit: number, offset: number): number {
    if (limit <= 0 || offset < 0) {
      return 1
    }
    return 1 + Math.floor(offset / limit) // We need +1 here because pages start at 1
  }

  getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const airGapTransactions: IAirGapTransaction[] = []
    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<any>[] = []
      for (let address of addresses) {
        promises.push(
          new Promise((resolve, reject) => {
            let page = this.getPageNumber(limit, offset)
            axios
              .get(
                this.infoAPI + 'transactions?address=' + address + '&page=' + page + '&limit=' + limit + '&filterContractInteraction=true'
              )
              .then(response => {
                const transactionResponse = response.data
                for (let transaction of transactionResponse.docs) {
                  const fee = new BigNumber(transaction.gasUsed).times(new BigNumber(transaction.gasPrice))
                  const airGapTransaction: IAirGapTransaction = {
                    hash: transaction.id,
                    from: [transaction.from],
                    to: [transaction.to],
                    isInbound: transaction.to.toLowerCase() === address.toLowerCase(),
                    amount: new BigNumber(transaction.value),
                    fee: fee,
                    blockHeight: transaction.blockNumber,
                    protocolIdentifier: this.identifier,
                    timestamp: parseInt(transaction.timeStamp, 10)
                  }

                  airGapTransactions.push(airGapTransaction)
                }

                resolve(airGapTransactions)
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
}
