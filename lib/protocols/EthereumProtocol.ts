import { ICoinProtocol } from './ICoinProtocol'
import { INetwork } from '../networks'

import * as bitcoinJS from 'bitcoinjs-lib'
import { BigNumber } from 'bignumber.js'
import * as ethUtil from 'ethereumjs-util'
import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import axios from 'axios'

const Web3 = require('web3') // tslint:disable-line
const EthereumTransaction = require('ethereumjs-tx')

export class EthereumProtocol implements ICoinProtocol {
  symbol = 'ETH'
  name = 'Ethereum'
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

  web3: any
  network: INetwork
  chainId: number
  infoAPI: string

  constructor(jsonRPCAPI = 'https://mainnet.infura.io/', infoAPI = 'https://api.trustwalletapp.com/', chainId = 1) {
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

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string> {
    return Promise.reject('extended private key signing for ether not implemented')
  }

  signWithPrivateKey(extendedPrivateKey: Buffer, transaction: any): Promise<string> {
    if (
      transaction.from !== ethUtil.toChecksumAddress((ethUtil.privateToAddress(Buffer.from(extendedPrivateKey)) as Buffer).toString('hex'))
    ) {
      return Promise.reject('from property and private-key do not match')
    }

    const txParams = {
      nonce: this.web3.utils.toHex(transaction.nonce),
      gasPrice: this.web3.utils.toHex(transaction.gasPrice),
      gasLimit: this.web3.utils.toHex(transaction.gasLimit),
      to: transaction.to,
      value: this.web3.utils.toHex(new BigNumber(transaction.value)),
      chainId: this.web3.utils.toHex(this.chainId)
    }

    const tx = new EthereumTransaction(txParams)
    tx.sign(extendedPrivateKey)

    return Promise.resolve(tx.serialize().toString('hex'))
  }

  getTransactionDetails(transaction: any): IAirGapTransaction {
    return {
      from: transaction.from ? [transaction.from] : [],
      to: [transaction.to],
      amount: new BigNumber(transaction.value),
      fee: new BigNumber(transaction.gasLimit).multipliedBy(new BigNumber(transaction.gasPrice)),
      protocolIdentifier: this.identifier,
      isInbound: false,
      timestamp: parseInt(transaction.timestamp, 10)
    }
  }

  getTransactionDetailsFromRaw(transaction: any, rawTx: any): IAirGapTransaction {
    const ethTx = new EthereumTransaction(rawTx)

    let hexValue = ethTx.value.toString('hex') || '0x0'
    let hexGasPrice = ethTx.gasPrice.toString('hex') || '0x0'
    let hexGasLimit = ethTx.gasLimit.toString('hex') || '0x0'
    let hexNonce = ethTx.nonce.toString('hex') || '0x0'

    return {
      from: ['0x' + ethTx.from.toString('hex')],
      to: ['0x' + ethTx.to.toString('hex')],
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
  ): Promise<any> {
    return Promise.reject('extended public tx for ether not implemented')
  }

  prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any> {
    const address = this.getAddressFromPublicKey(publicKey)

    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }

    return new Promise((resolve, reject) => {
      this.getBalanceOfAddresses([address])
        .then(balance => {
          const gasLimit = 21000
          const gasPrice = fee.div(gasLimit).integerValue(BigNumber.ROUND_CEIL)
          if (new BigNumber(balance).gte(new BigNumber(values[0].plus(fee)))) {
            this.web3.eth.getTransactionCount(address).then(txCount => {
              const transaction = {
                nonce: txCount,
                gasLimit: gasLimit,
                gasPrice: gasPrice, // 10 Gwei
                to: recipients[0],
                from: address,
                value: values[0],
                chainId: this.chainId
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

  getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const airGapTransactions: IAirGapTransaction[] = []
    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<any>[] = []
      for (let address of addresses) {
        promises.push(
          new Promise((resolve, reject) => {
            axios
              .get(
                this.infoAPI +
                  'transactions?address=' +
                  address +
                  '&page=' +
                  offset / limit +
                  '&limit=' +
                  limit +
                  '&filterContractInteraction=true'
              )
              .then(response => {
                const transactionResponse = response.data
                for (let transaction of transactionResponse.docs) {
                  const airGapTransaction = {
                    hash: transaction.id,
                    from: [transaction.from],
                    to: [transaction.to],
                    isInbound: transaction.to.toLowerCase() === address.toLowerCase(),
                    amount: new BigNumber(transaction.value),
                    blockHeight: transaction.blockNumber,
                    protocolIdentifier: this.identifier,
                    timestamp: parseInt(transaction.timeStamp, 10)
                  } as IAirGapTransaction // Add fee?

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
