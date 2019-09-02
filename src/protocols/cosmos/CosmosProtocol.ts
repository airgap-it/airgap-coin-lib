import { CosmosNodeClient } from './CosmosNodeClient'
import { ICoinProtocol } from '../ICoinProtocol'
import { ICoinSubProtocol } from '../ICoinSubProtocol'
import { NonExtendedProtocol } from '../NonExtendedProtocol'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { UnsignedTransaction } from '../../serializer/unsigned-transaction.serializer'
import { SignedTransaction } from '../../serializer/signed-transaction.serializer'

import * as bip32 from 'bip32'
import { BIP32Interface } from 'bip32'
import { BigNumber } from 'bignumber.js'
import { RawCosmosSendMessage, RawCosmosTransaction } from '../../serializer/unsigned-transactions/cosmos-transactions.serializer'

// const secp256k1 = require('secp256k1')
const RIPEMD160 = require('ripemd160')

export class CosmosProtocol<NodeClient extends CosmosNodeClient> extends NonExtendedProtocol implements ICoinProtocol {
  public symbol: string = '⌀'
  public name: string = 'Cosmos'
  public marketSymbol: string = 'Atom'
  public feeSymbol: string = 'uatom'
  public feeDefaults = {
    low: new BigNumber(0.025),
    medium: new BigNumber(0.025),
    high: new BigNumber(0.025)
  }
  public decimals: number = 18
  public feeDecimals: number = 18
  public identifier: string = 'cosmos'
  public units = [
    {
      unitSymbol: 'atom',
      factor: new BigNumber(1)
    },
    {
      unitSymbol: 'uatom',
      factor: new BigNumber(1).shiftedBy(-6)
    }
  ]
  public supportsHD: boolean = true
  public standardDerivationPath: string = `m/44'/118'/0'/0/0`
  public addressIsCaseSensitive: boolean = false
  public addressValidationPattern: string = '^cosmos[a-fA-F0-9]{40}$'
  public addressPlaceholder: string = 'cosmosabc...'
  public blockExplorer: string = 'https://www.mintscan.io'
  public subProtocols?: (ICoinProtocol & ICoinSubProtocol)[] | undefined

  public nodeClient: NodeClient

  private addressPrefix = 'cosmos'

  constructor(nodeClient: NodeClient) {
    super()
    this.nodeClient = nodeClient
  }

  public getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}/account/${address}`
  }

  public getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}/tx/${txId}`
  }

  public getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    let node: BIP32Interface = bip32.fromSeed(Buffer.from(secret, 'hex'))
    let keys = node.derivePath(derivationPath)
    return keys.publicKey.toString('hex')
  }

  public getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    let node = bip32.fromSeed(Buffer.from(secret, 'hex'))
    let keys = node.derivePath(derivationPath)
    let privateKey = keys.privateKey
    if (privateKey) {
      return Buffer.from(privateKey.buffer)
    }
    throw new Error('Cannot generate private key')
  }

  public async getAddressFromPublicKey(publicKey: string): Promise<string> {
    return new Promise(resolve => {
      let encoder = new TextEncoder()
      window.crypto.subtle.digest('SHA-256', encoder.encode(publicKey)).then(value => {
        let decoder = new TextDecoder()
        let digest = decoder.decode(value)
        let address = new RIPEMD160().update(digest).digest('hex')
        resolve(`${this.addressPrefix}${address}`)
      })
    })
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    return [await this.getAddressFromPublicKey(publicKey)]
  }

  public async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return await this.getTransactionsFromAddresses([await this.getAddressFromPublicKey(publicKey)], limit, offset)
  }

  private getPageNumber(limit: number, offset: number): number {
    if (limit <= 0 || offset < 0) {
      return 0
    }
    return Math.floor(offset / limit) // we need +1 here because pages start at 1
  }

  public async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const promises: Promise<IAirGapTransaction[]>[] = []
    const page = this.getPageNumber(limit, offset)
    for (const address in addresses) {
      promises.push(this.nodeClient.fetchTransactions(address, page, limit))
    }
    return Promise.all(promises).then(transactions => transactions.reduce((current, next) => current.concat(next)))
  }

  public async signWithPrivateKey(privateKey: Buffer, transaction: RawCosmosTransaction): Promise<string> {}

  public async getTransactionDetails(transaction: UnsignedTransaction): Promise<IAirGapTransaction> {
    throw new Error('Method not implemented.')
  }

  public async getTransactionDetailsFromSigned(transaction: SignedTransaction): Promise<IAirGapTransaction> {
    throw new Error('Method not implemented.')
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    const promises: Promise<BigNumber>[] = []
    for (const address in addresses) {
      promises.push(this.nodeClient.fetchBalance(address))
    }
    return Promise.all(promises).then(balances => {
      return balances.reduce((current, next) => {
        return current.plus(next)
      })
    })
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    return await this.getBalanceOfAddresses([await this.getAddressFromPublicKey(publicKey)])
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    data?: any
  ): Promise<any> {
    const address = await this.getAddressFromPublicKey(publicKey)
    const nodeInfo = await this.nodeClient.fetchNodeInfo()

    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    const messages: RawCosmosSendMessage[] = []
    for (let i = 0; i < recipients.length; ++i) {
      const message: RawCosmosSendMessage = {
        fromAddress: address,
        toAddress: recipients[i],
        coins: [
          {
            denom: 'uatom',
            amount: values[i]
          }
        ]
      }
      messages.push(message)
    }
    const transaction: RawCosmosTransaction = {
      messages: messages,
      fee: {
        amount: [
          {
            denom: this.feeSymbol,
            amount: fee
          }
        ],
        gas: new BigNumber('200000')
      },
      memo: data !== undefined && typeof data === 'string' ? (data as string) : '',
      chainID: nodeInfo.network
    }
    return transaction
  }

  public async broadcastTransaction(rawTransaction: any): Promise<string> {
    throw new Error('Method not implemented.')
  }
}
