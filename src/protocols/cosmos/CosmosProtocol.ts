import { CosmosNodeClient } from './CosmosNodeClient'
import { ICoinProtocol } from '../ICoinProtocol'
import { ICoinSubProtocol } from '../ICoinSubProtocol'
import { NonExtendedProtocol } from '../NonExtendedProtocol'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { SignedTransaction } from '../../serializer/signed-transaction.serializer'

import { BIP32Interface, fromSeed } from 'bip32'
import { mnemonicToSeed, validateMnemonic } from 'bip39'
import { BigNumber } from 'bignumber.js'
import {
  RawCosmosSendMessage,
  RawCosmosTransaction,
  RawCosmosCoin,
  RawCosmosFee,
  RawCosmosDelegateMessage,
  UnsignedCosmosTransaction,
  RawCosmosMessageType
} from '../../serializer/unsigned-transactions/cosmos-transactions.serializer'

import RIPEMD160 = require('ripemd160')
import BECH32 = require('bech32')
import SECP256K1 = require('secp256k1')

export interface KeyPair {
  publicKey: Buffer
  privateKey: Buffer
}

export class CosmosProtocol extends NonExtendedProtocol implements ICoinProtocol {
  public symbol: string = '⌀'
  public name: string = 'Cosmos'
  public marketSymbol: string = 'ATOM'
  public feeSymbol: string = 'uatom'
  public feeDefaults = {
    // TODO: verify if these values are ok
    low: new BigNumber(500),
    medium: new BigNumber(5000),
    high: new BigNumber(7500)
  }
  public decimals: number = 6 // TODO: verify these values
  public feeDecimals: number = 6
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
  public addressValidationPattern: string = '^cosmos[a-zA-Z0-9]{39}$'
  public addressPlaceholder: string = 'cosmos...'
  public blockExplorer: string = 'https://www.mintscan.io'
  public subProtocols?: (ICoinProtocol & ICoinSubProtocol)[] | undefined

  public nodeClient: CosmosNodeClient

  private addressPrefix: string = 'cosmos'
  private defaultGas: BigNumber = new BigNumber('200000')

  constructor(nodeClient: CosmosNodeClient = new CosmosNodeClient('https://lcd-do-not-abuse.cosmostation.io')) {
    super()
    this.nodeClient = nodeClient
  }

  public getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}/account/${address}`
  }

  public getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}/tx/${txId}`
  }

  public generateKeyPair(mnemonic: string, derivationPath: string = this.standardDerivationPath): KeyPair {
    validateMnemonic(mnemonic)
    const seed = mnemonicToSeed(mnemonic)
    const node = fromSeed(seed)
    return this.generateKeyPairFromNode(node, derivationPath)
  }

  private generateKeyPairFromNode(node: BIP32Interface, derivationPath: string): KeyPair {
    let keys = node.derivePath(derivationPath)
    let privateKey = keys.privateKey
    if (privateKey === undefined) {
      throw new Error('Cannot generate private key')
    }
    return {
      publicKey: keys.publicKey,
      privateKey: privateKey
    }
  }

  public getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    let node: BIP32Interface = fromSeed(Buffer.from(secret, 'hex'))
    return this.generateKeyPairFromNode(node, derivationPath).publicKey.toString('hex')
  }

  public getPublicKeyFromPrivateKey(privateKey: Buffer): Buffer {
    const publicKey = SECP256K1.publicKeyCreate(privateKey)
    return Buffer.from(publicKey, 'binary')
  }

  public getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    let node = fromSeed(Buffer.from(secret, 'hex'))
    return this.generateKeyPairFromNode(node, derivationPath).privateKey
  }

  public async getAddressFromPublicKey(publicKey: string): Promise<string> {
    const pubkey = Buffer.from(publicKey, 'hex')
    const sha256Hash = await crypto.subtle.digest('SHA-256', pubkey)
    const hash = new RIPEMD160().update(Buffer.from(sha256Hash)).digest()
    const address = BECH32.encode(this.addressPrefix, BECH32.toWords(hash))
    return address
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
    for (const address of addresses) {
      promises.push(this.nodeClient.fetchTransactions(address, page, limit))
    }
    return Promise.all(promises).then(transactions => transactions.reduce((current, next) => current.concat(next)))
  }

  public async signWithPrivateKey(privateKey: Buffer, transaction: RawCosmosTransaction): Promise<string> {
    const publicKey = this.getPublicKeyFromPrivateKey(privateKey)
    const toSign = transaction.toJSON(transaction.accountNumber, transaction.sequence)
    // TODO: check if sorting is needed
    const hash = Buffer.from(await crypto.subtle.digest('SHA-256', Buffer.from(JSON.stringify(toSign))))
    const signed = SECP256K1.sign(hash, privateKey)
    const sigBase64 = Buffer.from(signed.signature, 'binary').toString('base64')
    const signedTransaction = {
      tx: {
        msg: toSign.msgs,
        fee: toSign.fee,
        signatures: [
          {
            signature: sigBase64,
            pub_key: {
              type: 'tendermint/PubKeySecp256k1',
              value: publicKey.toString('base64') // TODO: check if this is optional
            }
          }
        ],
        memo: toSign.memo
      },
      mode: 'sync'
    }
    return JSON.stringify(signedTransaction)
  }

  public async getTransactionDetails(transaction: UnsignedCosmosTransaction): Promise<IAirGapTransaction[]> {
    return transaction.transaction.messages.map(message => {
      switch (message.type) {
        case RawCosmosMessageType.Send:
          const sendMessage = message as RawCosmosSendMessage
          return {
            amount: sendMessage.amount.map(value => value.amount).reduce((prev, next) => prev.plus(next)),
            to: [sendMessage.toAddress],
            from: [sendMessage.fromAddress],
            isInbound: false,
            fee: transaction.transaction.fee.amount.map(value => value.amount).reduce((prev, next) => prev.plus(next)),
            protocolIdentifier: this.identifier
          } as IAirGapTransaction
        case RawCosmosMessageType.Delegate || RawCosmosMessageType.Undelegate:
          const delegateMessage = message as RawCosmosDelegateMessage
          return {
            amount: delegateMessage.amount.amount,
            to: [delegateMessage.delegatorAddress],
            from: [delegateMessage.validatorAddress],
            isInbound: false,
            fee: transaction.transaction.fee.amount.map(value => value.amount).reduce((prev, next) => prev.plus(next)),
            protocolIdentifier: this.identifier
          } as IAirGapTransaction
        default:
          throw Error('Unknown transaction')
      }
    })
  }

  public async getTransactionDetailsFromSigned(transaction: SignedTransaction): Promise<IAirGapTransaction[]> {
    throw new Error('Method not implemented.')
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    const promises: Promise<BigNumber>[] = []
    for (const address of addresses) {
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
  ): Promise<RawCosmosTransaction> {
    const address = await this.getAddressFromPublicKey(publicKey)
    const nodeInfo = await this.nodeClient.fetchNodeInfo()
    const account = await this.nodeClient.fetchAccount(address)

    if (recipients.length !== values.length) {
      return Promise.reject('recipients length does not match with values')
    }

    const messages: RawCosmosSendMessage[] = []
    for (let i = 0; i < recipients.length; ++i) {
      const message = new RawCosmosSendMessage(address, recipients[i], [new RawCosmosCoin('uatom', values[i])])
      messages.push(message)
    }
    const memo = data !== undefined && typeof data === 'string' ? (data as string) : ''
    const transaction = new RawCosmosTransaction(
      messages,
      new RawCosmosFee([new RawCosmosCoin(this.feeSymbol, fee)], this.defaultGas),
      memo,
      nodeInfo.network,
      account.value.account_number,
      account.sequence
    )
    return transaction
  }

  public async delegate(
    publicKey: string,
    validatorAddress: string,
    amount: BigNumber,
    undelegate: boolean = false,
    memo?: string
  ): Promise<RawCosmosTransaction> {
    const address = await this.getAddressFromPublicKey(publicKey)
    const nodeInfo = await this.nodeClient.fetchNodeInfo()
    const account = await this.nodeClient.fetchAccount(address)
    const message = new RawCosmosDelegateMessage(address, validatorAddress, new RawCosmosCoin('uatom', amount), undelegate)

    return new RawCosmosTransaction(
      [message],
      new RawCosmosFee([new RawCosmosCoin(this.feeSymbol, this.feeDefaults.medium)], this.defaultGas),
      memo !== undefined ? memo : '',
      nodeInfo.network,
      account.value.account_number,
      account.sequence
    )
  }

  public async broadcastTransaction(rawTransaction: string): Promise<string> {
    return await this.nodeClient.broadcastSignedTransaction(rawTransaction)
  }

  public async signMessage(message: string, privateKey: Buffer): Promise<string> {
    throw new Error('Method not implemented.')
  }

  public async verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
}
