import { ICoinProtocol } from '../ICoinProtocol'
import { ICoinSubProtocol } from '../ICoinSubProtocol'
import { BigNumber } from 'bignumber.js'

import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { UnsignedTransaction } from '../../serializer/unsigned-transaction.serializer'
import { SignedTransaction } from '../..'

import * as bip32 from 'bip32'
import { BIP32Interface } from 'bip32'
import { NonExtendedProtocol } from '../NonExtendedProtocol'

const secp256k1 = require('secp256k1')
const RIPEMD160 = require('ripemd160')

export class CosmosProtocol extends NonExtendedProtocol implements ICoinProtocol {
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
  public blockExplorer: string = ''
  public subProtocols?: (ICoinProtocol & ICoinSubProtocol)[] | undefined

  private addressPrefix = 'cosmos'

  public getBlockExplorerLinkForAddress(address: string): string {
    throw new Error('Method not implemented.')
  }

  public getBlockExplorerLinkForTxId(txId: string): string {
    throw new Error('Method not implemented.')
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
    throw new Error('Method not implemented.')
  }

  public async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    throw new Error('Method not implemented.')
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
    throw new Error('Method not implemented.')
  }

  public async getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    throw new Error('Method not implemented.')
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
