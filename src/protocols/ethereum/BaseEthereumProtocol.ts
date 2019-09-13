import { BigNumber } from 'bignumber.js'
import * as bitcoinJS from 'bitcoinjs-lib'
import * as ethUtil from 'ethereumjs-util'

import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { Network } from '../../networks'
import { SignedEthereumTransaction } from '../../serializer/signed-transactions/ethereum-transactions.serializer'
import { UnsignedTransaction } from '../../serializer/unsigned-transaction.serializer'
import { RawEthereumTransaction } from '../../serializer/unsigned-transactions/ethereum-transactions.serializer'
import { getSubProtocolsByIdentifier } from '../../utils/subProtocols'
import { ICoinProtocol } from '../ICoinProtocol'
import { EthereumNodeClient } from './clients/node-clients/NodeClient'
import { EthereumInfoClient } from './clients/info-clients/InfoClient'
import { EthereumUtils } from './utils/utils'

const EthereumTransaction = require('ethereumjs-tx')

export interface EthereumProtocolConfiguration<NodeClient extends EthereumNodeClient, InfoClient extends EthereumInfoClient> {
  chainID: number
  nodeClient: NodeClient
  infoClient: InfoClient
}

export abstract class BaseEthereumProtocol<NodeClient extends EthereumNodeClient, InfoClient extends EthereumInfoClient>
  implements ICoinProtocol {
  public symbol = 'ETH'
  public name = 'Ethereum'
  public marketSymbol = 'eth'

  public feeSymbol = 'eth'

  public feeDefaults = {
    low: new BigNumber('0.00021'), // 21000 Gas * 2 Gwei
    medium: new BigNumber('0.000315'), // 21000 Gas * 15 Gwei
    high: new BigNumber('0.00084') // 21000 Gas * 40 Gwei
  }

  public decimals = 18
  public feeDecimals = 18
  public identifier = 'eth'

  public units = [
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

  public supportsHD = false
  public standardDerivationPath = `m/44'/60'/0'/0/0`

  public addressIsCaseSensitive = false
  public addressValidationPattern = '^0x[a-fA-F0-9]{40}$'
  public addressPlaceholder = '0xabc...'

  public blockExplorer = 'https://etherscan.io'

  public network: Network
  public configuration: EthereumProtocolConfiguration<NodeClient, InfoClient>

  get subProtocols() {
    return getSubProtocolsByIdentifier(this.identifier)
  }

  constructor(configuration: EthereumProtocolConfiguration<NodeClient, InfoClient>) {
    this.configuration = configuration
    this.network = bitcoinJS.networks.bitcoin
  }

  public getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}/address/{{address}}`.replace('{{address}}', address)
  }

  public getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}/tx/{{txId}}`.replace('{{txId}}', txId)
  }

  public getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network as bitcoinJS.Network)
    return ethereumNode
      .derivePath(derivationPath)
      .neutered()
      .getPublicKeyBuffer()
      .toString('hex')
  }

  public getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    const ethereumNode = bitcoinJS.HDNode.fromSeedHex(secret, this.network as bitcoinJS.Network)
    return ethereumNode.derivePath(derivationPath).keyPair.d.toBuffer(32)
  }

  public getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string {
    throw new Error('extended private key support for ether not implemented')
  }

  public async getAddressFromPublicKey(publicKey: string | Buffer): Promise<string> {
    if (typeof publicKey === 'string') {
      return ethUtil.toChecksumAddress((ethUtil.pubToAddress(Buffer.from(publicKey, 'hex'), true) as Buffer).toString('hex'))
    }

    return ethUtil.toChecksumAddress((ethUtil.pubToAddress(publicKey, true) as Buffer).toString('hex'))
  }

  public async getAddressesFromPublicKey(publicKey: string | Buffer): Promise<string[]> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return [address]
  }

  public async getAddressFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressDerivationIndex: number
  ): Promise<string> {
    return this.getAddressFromPublicKey(
      bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network as bitcoinJS.Network)
        .derive(visibilityDerivationIndex)
        .derive(addressDerivationIndex)
        .getPublicKeyBuffer()
        .toString('hex')
    )
  }

  public getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): Promise<string[]> {
    const node = bitcoinJS.HDNode.fromBase58(extendedPublicKey, this.network as bitcoinJS.Network)
    const generatorArray = [addressCount].map((x, i) => i + offset)
    return Promise.all(
      generatorArray.map(x =>
        this.getAddressFromPublicKey(
          node
            .derive(visibilityDerivationIndex)
            .derive(x)
            .getPublicKeyBuffer()
            .toString('hex')
        )
      )
    )
  }

  public signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: RawEthereumTransaction): Promise<IAirGapSignedTransaction> {
    return Promise.reject('extended private key signing for ether not implemented')
  }

  public async signWithPrivateKey(privateKey: Buffer, transaction: RawEthereumTransaction): Promise<IAirGapSignedTransaction> {
    const tx = new EthereumTransaction(transaction)
    tx.sign(privateKey)
    return tx.serialize().toString('hex')
  }

  public async getTransactionDetails(unsignedTx: UnsignedTransaction): Promise<IAirGapTransaction[]> {
    const transaction = unsignedTx.transaction as RawEthereumTransaction
    return [
      {
        from: [await this.getAddressFromPublicKey(unsignedTx.publicKey)],
        to: [transaction.to],
        amount: new BigNumber(transaction.value),
        fee: new BigNumber(transaction.gasLimit).multipliedBy(new BigNumber(transaction.gasPrice)),
        protocolIdentifier: this.identifier,
        isInbound: false,
        data: transaction.data
      }
    ]
  }

  public async getTransactionDetailsFromSigned(transaction: SignedEthereumTransaction): Promise<IAirGapTransaction[]> {
    const ethTx = new EthereumTransaction(transaction.transaction)

    const hexValue = ethTx.value.toString('hex') || '0x0'
    const hexGasPrice = ethTx.gasPrice.toString('hex') || '0x0'
    const hexGasLimit = ethTx.gasLimit.toString('hex') || '0x0'
    const hexNonce = ethTx.nonce.toString('hex') || '0x0'

    return [
      {
        from: [ethUtil.toChecksumAddress(`0x${ethTx.from.toString('hex')}`)],
        to: [ethUtil.toChecksumAddress(`0x${ethTx.to.toString('hex')}`)],
        amount: new BigNumber(parseInt(hexValue, 16)),
        fee: new BigNumber(parseInt(hexGasLimit, 16)).multipliedBy(new BigNumber(parseInt(hexGasPrice, 16))),
        protocolIdentifier: this.identifier,
        isInbound: ethTx.toCreationAddress(),
        hash: `0x${ethTx.hash().toString('hex')}`,
        meta: {
          nonce: parseInt(hexNonce, 16)
        },
        data: `0x${ethTx.data.toString('hex')}`
      }
    ]
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    const balances = await Promise.all(
      addresses.map(address => {
        return this.configuration.nodeClient.fetchBalance(address)
      })
    )
    return balances.reduce((a, b) => a.plus(b))
  }

  public getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number = 0): Promise<BigNumber> {
    return Promise.reject('extended public balance for ether not implemented')
  }

  public prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<RawEthereumTransaction> {
    return Promise.reject('extended public tx for ether not implemented')
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    data?: any
  ): Promise<RawEthereumTransaction> {
    const address = await this.getAddressFromPublicKey(publicKey)

    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    if (recipients.length !== 1) {
      return Promise.reject('you cannot have 0 recipients')
    }

    const balance = await this.getBalanceOfPublicKey(publicKey)
    const gasLimit = new BigNumber(21000)
    const gasPrice = fee.div(gasLimit).integerValue(BigNumber.ROUND_CEIL)
    if (new BigNumber(balance).gte(new BigNumber(values[0].plus(fee)))) {
      const txCount = await this.configuration.nodeClient.fetchTransactionCount(address)
      const transaction: RawEthereumTransaction = {
        nonce: EthereumUtils.toHex(txCount),
        gasLimit: EthereumUtils.toHex(gasLimit.toFixed()),
        gasPrice: EthereumUtils.toHex(gasPrice.toFixed()), // 10 Gwei
        to: recipients[0],
        value: EthereumUtils.toHex(values[0].toFixed()),
        chainId: this.configuration.chainID,
        data: '0x'
      }

      return transaction
    } else {
      throw new Error('not enough balance')
    }
  }

  public async broadcastTransaction(rawTransaction: string): Promise<string> {
    return await this.configuration.nodeClient.sendSignedTransaction(`0x${rawTransaction}`)
  }

  public getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return Promise.reject('extended public transaction list for ether not implemented')
  }

  public async getTransactionsFromPublicKey(publicKey: string, limit: number = 50, offset: number = 0): Promise<IAirGapTransaction[]> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getTransactionsFromAddresses([address], limit, offset)
  }

  private getPageNumber(limit: number, offset: number): number {
    if (limit <= 0 || offset < 0) {
      return 1
    }
    return 1 + Math.floor(offset / limit) // We need +1 here because pages start at 1
  }

  public getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const page = this.getPageNumber(limit, offset)
    return new Promise((overallResolve, overallReject) => {
      const promises: Promise<IAirGapTransaction[]>[] = []
      for (const address of addresses) {
        promises.push(this.configuration.infoClient.fetchTransactions(this.identifier, address, page, limit))
      }
      Promise.all(promises)
        .then(values => {
          overallResolve(
            values.reduce((a, b) => {
              return a.concat(b)
            })
          )
        })
        .catch(overallReject)
    })
  }

  async signMessage(message: string, privateKey: Buffer): Promise<string> {
    return Promise.reject('Message signing not implemented')
  }

  async verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
    return Promise.reject('Message verification not implemented')
  }
}
