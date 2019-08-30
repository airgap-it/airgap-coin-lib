import { ICoinProtocol } from '../ICoinProtocol'
import { ICoinSubProtocol } from '../ICoinSubProtocol'
import { BigNumber } from 'bignumber.js'

import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { UnsignedTransaction } from '../../serializer/unsigned-transaction.serializer'
import { SignedTransaction } from '../..'

import * as bip32 from 'bip32'
import { BIP32Interface } from 'bip32'
import { NonExtendedProtocol } from '../NonExtendedProtocol'

import axios from 'axios'

// const secp256k1 = require('secp256k1')
const RIPEMD160 = require('ripemd160')

export interface NodeInfo {
  protocol_version: {
    p2p: string
    block: string
    app: string
  }
  id: string
  listen_addr: string
  network: string
  version: string
  channels: string
  moniker: string
  other: {
    tx_index: string
    rpc_address: string
  }
}

export abstract class CosmosNodeClient {
  public baseURL: string
  public identifier: string

  constructor(identifier: string, baseURL: string) {
    this.baseURL = baseURL
    this.identifier = identifier
  }

  public abstract async fetchTransactions(address: string, page: number, limit: number): Promise<IAirGapTransaction[]>
  public abstract async fetchBalance(address: string): Promise<BigNumber>
  public abstract async fetchNodeInfo(): Promise<NodeInfo>
}

export class CosmosJSONRPCNodeClient extends CosmosNodeClient {
  constructor(identifier: string, baseURL: string = 'https://lcd-do-not-abuse.cosmostation.io') {
    super(identifier, baseURL)
  }

  public async fetchTransactions(address: string, page: number, limit: number): Promise<IAirGapTransaction[]> {
    const promises: Promise<IAirGapTransaction[]>[] = []
    promises.push(
      new Promise((resolve, reject) => {
        axios
          .get(`${this.baseURL}/txs?message.sender=${address}&page=${page}&limit=${limit}`)
          .then(response => {
            const transactionResponse = response.data
            const airGapTransactions: IAirGapTransaction[] = []
            for (const transaction of transactionResponse) {
            }
            resolve(airGapTransactions)
          })
          .catch(reject)
      })
    )
    promises.push(
      new Promise((resolve, reject) => {
        axios
          .get(`${this.baseURL}/txs?transfer.receiver=${address}&page=${page}&limit=${limit}`)
          .then(response => {
            const transactionResponse = response.data
            const airGapTransactions: IAirGapTransaction[] = []
            for (const transaction of transactionResponse) {
            }
            resolve(airGapTransactions)
          })
          .catch(reject)
      })
    )
    return Promise.all(promises).then(transactions => {
      return transactions.reduce((current, next) => {
        return current.concat(next)
      })
    })
  }

  public async fetchBalance(address: string): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this.baseURL}/bank/balances/${address}`)
        .then(response => {
          const data: any[] = response.data
          if (data.length > 0) {
            resolve(new BigNumber(data[0].amount))
          } else {
            resolve(new BigNumber(0))
          }
        })
        .catch(reject)
    })
  }

  public async fetchNodeInfo(): Promise<NodeInfo> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this.baseURL}/node_info`)
        .then(response => {
          const nodeInfo = response.data as NodeInfo
          resolve(nodeInfo)
        })
        .catch(reject)
    })
  }
}

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

  public async signWithPrivateKey(privateKey: Buffer, transaction: any): Promise<string> {
    throw new Error('Method not implemented.')
  }

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
    throw new Error('Method not implemented.')
  }

  public async broadcastTransaction(rawTransaction: any): Promise<string> {
    throw new Error('Method not implemented.')
  }
}
