import { ICoinProtocol } from './ICoinProtocol'
import BigNumber from 'bignumber.js'
import { IAirGapTransaction } from '..'

import * as nacl from 'tweetnacl'
import { generateHDWallet, getHDWalletAccounts } from '@aeternity/hd-wallet'
import axios from 'axios'
import * as rlp from 'rlp'
import * as bs58check from 'bs58check'

export class AEProtocol implements ICoinProtocol {
  symbol = 'AE'
  name = 'Aeternity'
  feeSymbol = 'ae'

  decimals = 18
  feeDecimals = 18
  identifier = 'ae'

  feeDefaults = {
    low: new BigNumber('0.00021'), // 21000 Gas * 2 Gwei
    medium: new BigNumber('0.000315'), // 21000 Gas * 15 Gwei
    high: new BigNumber('0.00084') // 21000 Gas * 40 Gwei
  }

  units = [
    {
      unitSymbol: 'AE',
      factor: new BigNumber(1)
    }
  ]

  supportsHD = false
  standardDerivationPath = `m/44h/457h`
  addressValidationPattern = '^ak_+[1-9A-Za-z][^OIl]{48}$'

  constructor(private epochRPC = 'https://sdk-edgenet.aepps.com') {}

  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    const { publicKey } = getHDWalletAccounts(generateHDWallet(secret), 1)[0]
    return Buffer.from(publicKey).toString('hex')
  }

  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    const { secretKey } = getHDWalletAccounts(generateHDWallet(secret), 1)[0]
    return Buffer.from(secretKey)
  }

  /**
   * Currently, the AE Address is just the Public Key. Address Format tbd
   */
  getAddressFromPublicKey(publicKey: string): string {
    const base58 = bs58check.encode(Buffer.from(publicKey, 'hex'))
    return 'ak_' + base58
  }

  getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return Promise.resolve([{} as IAirGapTransaction])
  }

  getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return Promise.resolve([{} as IAirGapTransaction])
  }

  signWithPrivateKey(privateKey: Buffer, transaction: any): Promise<string> {
    // sign and cut off first byte ('ae')
    const rawTx = bs58check.decode(transaction.slice(3))
    const signature = nacl.sign.detached(rawTx, privateKey)

    const txObj = {
      tag: Buffer.from([11]),
      version: Buffer.from([1]),
      signatures: [Buffer.from(signature)],
      transaction: rawTx
    }

    const txArray = Object.keys(txObj).map(a => txObj[a])

    const rlpEncodedTx = rlp.encode(txArray)
    const signedEncodedTx = 'tx_' + bs58check.encode(rlpEncodedTx)

    return Promise.resolve(signedEncodedTx)
  }

  getTransactionDetails(transaction: any): IAirGapTransaction {
    const rlpEncodedTx = bs58check.decode(transaction, 'hex')
    const rlpDecodedTx = rlp.decode(rlpEncodedTx.slice(0, rlp.getLength(rlpEncodedTx)))

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(parseInt(rlpDecodedTx[4].toString('hex'), 16)),
      fee: new BigNumber(parseInt(rlpDecodedTx[5].toString('hex'), 16)),
      from: [rlpDecodedTx[2].toString('hex')],
      isInbound: false,
      protocolIdentifier: this.identifier,
      to: [rlpDecodedTx[3].toString('hex')]
    }

    return airgapTx
  }

  getTransactionDetailsFromRaw(transaction: any, rawTx: any): IAirGapTransaction {
    const rlpEncodedTawTx = bs58check.decode(rawTx, 'hex')
    const rlpDecodedRawTx = rlp.decode(rlpEncodedTawTx.slice(0, rlp.getLength(rlpEncodedTawTx)))
    return this.getTransactionDetails(rlpDecodedRawTx[3])
  }

  async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    let balance = new BigNumber(0)

    await Promise.all(
      addresses.map(async address => {
        const { data } = await axios.get(`${this.epochRPC}/v2/accounts/${address}`)
        balance.plus(new BigNumber(data.balance))
      })
    )

    return balance
  }

  getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }

  prepareTransactionFromPublicKey(publicKey: string, recipients: string[], values: BigNumber[], fee: BigNumber): Promise<any> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this.epochRPC}/v2/accounts/${this.getAddressFromPublicKey(publicKey)}`)
        .then(({ data }) => {
          const sender = publicKey
          const recipient = bs58check.decode(recipients[0].replace('ak_', ''))

          const txObj = {
            tag: Buffer.from([12]),
            version: Buffer.from([1]),
            sender_id: Buffer.concat([Buffer.from([1]), Buffer.from(sender, 'hex')]),
            recipient_id: Buffer.concat([Buffer.from([1]), recipient]),
            amount: Buffer.from([values[0].toNumber()]),
            fee: Buffer.from([fee.toNumber()]),
            ttl: Buffer.from([60]),
            nonce: Buffer.from([data.nonce + 1]),
            payload: Buffer.from('')
          }

          const txArray = Object.keys(txObj).map(a => txObj[a])
          const rlpEncodedTx = rlp.encode(txArray)
          const preparedTx = 'tx_' + bs58check.encode(rlpEncodedTx)

          resolve(preparedTx)
        })
        .catch(reject)
    })
  }

  async broadcastTransaction(rawTransaction: string): Promise<any> {
    const { data } = await axios.post(`${this.epochRPC}/v2/transactions`, { tx: rawTransaction })
    return Promise.resolve(data)
  }

  // Unsupported Functionality for Aeternity
  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string {
    throw new Error('extended private key support for aeternity not implemented')
  }

  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<BigNumber> {
    return Promise.reject('extended public balance for aeternity not implemented')
  }

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string> {
    return Promise.reject('extended private key signing for aeternity not implemented')
  }

  getAddressFromExtendedPublicKey(extendedPublicKey: string, visibilityDerivationIndex: number, addressDerivationIndex: number): string {
    return ''
  }

  getAddressesFromExtendedPublicKey(
    extendedPublicKey: string,
    visibilityDerivationIndex: number,
    addressCount: number,
    offset: number
  ): string[] {
    return []
  }

  getTransactionsFromExtendedPublicKey(extendedPublicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return Promise.resolve([{} as IAirGapTransaction])
  }

  prepareTransactionFromExtendedPublicKey(
    extendedPublicKey: string,
    offset: number,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<any> {
    return Promise.reject('extended public tx for aeternity not implemented')
  }
}
