import { ICoinProtocol } from './ICoinProtocol'
import BigNumber from 'bignumber.js'
import { IAirGapTransaction } from '..'
import * as nacl from 'tweetnacl'
import { generateWalletUsingDerivationPath } from '@aeternity/hd-wallet'
import axios from 'axios'
import * as rlp from 'rlp'
import * as bs58check from 'bs58check'
import * as sodium from 'libsodium-wrappers'

import {
  RawAeternityTransaction,
  UnsignedAeternityTransaction
} from '../serializer/unsigned-transactions/aeternity-transactions.serializer'

import { SignedAeternityTransaction } from '../serializer/signed-transactions/aeternity-transactions.serializer'
import * as eztz from 'eztz'
import { padStart } from '../utils/padStart'

export class TezosProtocol implements ICoinProtocol {
  symbol = 'XTZ'
  name = 'Tezos'
  marketSymbol = 'xtz'

  feeSymbol = 'xtz'

  decimals = 6
  feeDecimals = 6 // micro tez is the smallest, 1000000 microtez is 1 tez
  identifier = 'xtz'

  // TODO this is just copied from another protocol, needs to be implemented with some "real" values.
  feeDefaults = {
    low: new BigNumber('0.00021'), // 21000 Gas * 2 Gwei
    medium: new BigNumber('0.000315'), // 21000 Gas * 15 Gwei
    high: new BigNumber('0.00084') // 21000 Gas * 40 Gwei
  }

  units = [
    {
      unitSymbol: 'XTZ',
      factor: new BigNumber(1)
    }
  ]

  // these prefixes are chosen and static in a way that when converted to base58 the have the expected output e.g. tz1...
  prefixes = {
    tz1: new Uint8Array([6, 161, 159]),
    tz2: new Uint8Array([6, 161, 161]),
    tz3: new Uint8Array([6, 161, 164])
  }

  chainId: 'PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP'

  supportsHD = false
  standardDerivationPath = `m/44h/1729h/0h/0h/0`
  addressValidationPattern = '^tz1[1-9A-Za-z]{33}$'

  constructor(public jsonRPCAPI = 'https://rpc.tezrpc.me', public baseApiUrl = 'https://api5.tzscan.io') {}
  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    // TODO both AE and tezos use the same ECC curves (ed25519), probably using the same derivation method should work. This needs to be tested with ledger nano S. Also in the tezos world in general there is no concept of derivation path, maybe providing no path, should result in the same address like all other "standard" tezos clients out there.
    const { publicKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)
    return Buffer.from(publicKey).toString('hex')
  }

  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    // TODO both AE and tezos use the same ECC curves (ed25519), probably using the same derivation method should work. This needs to be tested with ledger nano S. Also in the tezos world in general there is no concept of derivation path, maybe providing no path, should result in the same address like all other "standard" tezos clients out there.
    const { secretKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)
    return Buffer.from(secretKey)
  }

  getAddressFromPublicKey(publicKey: string): string {
    // taken from https://github.com/TezTech/eztz/blob/master/src/main.js line 66
    const payload = sodium.crypto_generichash(20, Buffer.from(publicKey, 'hex'))

    const n = new Uint8Array(prefix.tz1.length + payload.length)
    n.set(prefix.tz1)
    n.set(payload, prefix.tz1.length)
    return bs58check.encode(new Buffer(n, 'hex'))
  }

  async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return this.getTransactionsFromAddresses([this.getAddressFromPublicKey(publicKey)], limit, offset)
  }

  async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const allTransactions = await Promise.all(
      addresses.map(address => {
        return axios.get(`${this.baseApiUrl}/v1/operations/${address}?type=Transaction&p=${offset}&number=${limit}`)
      })
    )

    const transactions: any[] = [].concat(
      ...allTransactions.map(axiosData => {
        return axiosData.data
      })
    )

    return transactions.map(obj => {
      const airGapTx: IAirGapTransaction = {
        amount: new BigNumber(obj.operations.amount),
        fee: new BigNumber(obj.operations.fee),
        from: [obj.operations.source.tz],
        isInbound: addresses.indexOf(obj.operations.destination.tz) !== -1,
        protocolIdentifier: this.identifier,
        to: [obj.operations.destination.tz],
        hash: obj.hash,
        blockHeight: obj.operations.op_level // TODO show correct height
      }

      return airGapTx
    })
  }

  // TODO Not implemented yet, see https://github.com/kukai-wallet/kukai/blob/master/src/app/services/operation.service.ts line 462 it requires libsodium
  signWithPrivateKey(privateKey: Buffer, transaction: RawAeternityTransaction): Promise<string> {
    // sign and cut off first byte ('ae')

    var operation = {
      kind: 'transaction',
      fee: fee.toString(),
      gas_limit: '10100', // taken from eztz
      storage_limit: '0', // taken from eztz
      amount: utility.mutez(amount).toString(),
      destination: to
    } // tezos has this concept of "operations"
    const rawTx = bs58check.decode(transaction.transaction.slice(3))
    const signature = nacl.sign.detached(Buffer.concat([Buffer.from(transaction.networkId), rawTx]), privateKey)

    const txObj = {
      tag: this.toHexBuffer(11),
      version: this.toHexBuffer(1),
      signatures: [Buffer.from(signature)],
      transaction: rawTx
    }

    const txArray = Object.keys(txObj).map(a => txObj[a])

    const rlpEncodedTx = rlp.encode(txArray)
    const signedEncodedTx = 'tx_' + bs58check.encode(rlpEncodedTx)

    return Promise.resolve(signedEncodedTx)
  }

  // TODO Not implemented yet. The only difference between signed and unsigned is the "signature" property in the json object, see https://github.com/kukai-wallet/kukai/blob/master/src/app/services/operation.service.ts line 61
  getTransactionDetails(unsignedTx: UnsignedAeternityTransaction): IAirGapTransaction {
    const transaction = unsignedTx.transaction.transaction
    const rlpEncodedTx = bs58check.decode(transaction.replace('tx_', ''), 'hex')
    const rlpDecodedTx = rlp.decode(rlpEncodedTx)

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(parseInt(rlpDecodedTx[4].toString('hex'), 16)),
      fee: new BigNumber(parseInt(rlpDecodedTx[5].toString('hex'), 16)),
      from: [this.getAddressFromPublicKey(rlpDecodedTx[2].slice(1).toString('hex'))],
      isInbound: false,
      protocolIdentifier: this.identifier,
      to: [this.getAddressFromPublicKey(rlpDecodedTx[3].slice(1).toString('hex'))]
    }

    return airgapTx
  }

  // TODO Not implemented yet. The only difference between signed and unsigned is the "signature" property in the json object, see https://github.com/kukai-wallet/kukai/blob/master/src/app/services/operation.service.ts line 61
  getTransactionDetailsFromSigned(signedTx: SignedAeternityTransaction): IAirGapTransaction {
    const rlpEncodedTx = bs58check.decode(signedTx.transaction.replace('tx_', ''), 'hex')
    const rlpDecodedTx = rlp.decode(rlpEncodedTx)

    const unsignedAeternityTransaction: UnsignedAeternityTransaction = {
      publicKey: '',
      callback: '',
      transaction: {
        networkId: 'ae_mainnet',
        transaction: 'tx_' + bs58check.encode(rlpDecodedTx[3]).toString('hex')
      }
    }

    return this.getTransactionDetails(unsignedAeternityTransaction)
  }

  async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    let balance = new BigNumber(0)

    for (let address of addresses) {
      try {
        const { data } = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/balance`)
        balance = balance.plus(new BigNumber(data))
      } catch (error) {
        // if node returns 404 (which means 'no account found'), go with 0 balance
        if (error.response.status !== 404) {
          throw error
        }
      }
    }

    return balance
  }

  getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }

  // TODO RawAeternityTransaction needs to be adapted to the proper tezos version
  async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber
  ): Promise<RawAeternityTransaction> {
    let counter = new BigNumber(1)

    try {
      const { data: accountResponse } = await axios.get(
        `${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${this.getAddressFromPublicKey(publicKey)}/counter`
      )
      counter = new BigNumber(accountResponse).plus(1)
    } catch (error) {
      // if node returns 404 (which means 'no account found'), go with nonce 0
      if (error.response && error.response.status !== 404) {
        throw error
      }
    }

    const balance = await this.getBalanceOfPublicKey(publicKey)

    if (balance.isLessThan(fee)) {
      throw new Error('not enough balance')
    }

    const operation = {
      kind: 'transaction',
      fee: fee.toString(),
      gas_limit: '10100', // taken from eztz
      storage_limit: '0', // taken from eztz
      amount: values[0],
      protocol: this.chainId,
      destination: recipients[0],
      source: this.getAddressFromPublicKey(publicKey)
    }

    return operation
  }

  async broadcastTransaction(rawTransaction: string): Promise<any> {
    const { header } = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/header`)
    const { data } = await axios.post(
      `${this.jsonRPCAPI}/chains/${this.chainId}/blocks/${header}/helpers/forge/operations`,
      {
        branch: header,
        contents: JSON.parse(rawTransaction) // tezos uses json based txs...
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    node.query('/chains/' + head.chain_id + '/blocks/' + head.hash + '/helpers/forge/operations', opOb)
    return data.tx_hash
  }

  // probably not required
  private toHexBuffer(value: number | BigNumber): Buffer {
    const hexString = Web3.utils.toHex(value).substr(2)
    return Buffer.from(padStart(hexString, hexString.length % 2 === 0 ? hexString.length : hexString.length + 1, '0'), 'hex')
  }

  // Unsupported Functionality for Aeternity,
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
  ): Promise<RawAeternityTransaction> {
    return Promise.reject('extended public tx for aeternity not implemented')
  }
}
