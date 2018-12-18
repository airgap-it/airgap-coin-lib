import { ICoinProtocol } from './ICoinProtocol'
import BigNumber from 'bignumber.js'
import { IAirGapTransaction } from '..'
import * as nacl from 'tweetnacl'
import { generateWalletUsingDerivationPath } from '@aeternity/hd-wallet'
import axios from 'axios'
import * as bs58check from 'bs58check'
import { RawTezosTransaction, UnsignedTezosTransaction } from '../serializer/unsigned-transactions/tezos-transactions.serializer'
import { SignedTezosTransaction } from '../serializer/signed-transactions/tezos-transactions.serializer'
import { IAirGapSignedTransaction, TezosTransaction } from '../interfaces/IAirGapSignedTransaction'

export enum TezosOperationType {
  TRANSACTION = 'transaction'
}

export interface TezosWrappedOperation {
  branch: string
  contents: TezosOperation[]
}

export interface TezosOperation {
  destination: string
  amount: string
  storage_limit: string
  gas_limit: string
  counter: string
  fee: string
  source: string
  protocol: string
  kind: TezosOperationType
}

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

  supportsHD = false
  standardDerivationPath = `m/44h/1729h/0h/0h/0h`
  addressValidationPattern = '^tz1[1-9A-Za-z]{33}$'

  // Tezos
  private tezosPrefixes = {
    tz1: new Uint8Array([6, 161, 159]),
    tz2: new Uint8Array([6, 161, 161]),
    tz3: new Uint8Array([6, 161, 164])
  }

  private tezosChainId = 'PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP'

  /**
   * Tezos Implemention of ICoinProtocol
   * @param jsonRPCAPI
   * @param baseApiUrl
   */
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
    // potentially identical to sodium.crypto_generichash(20, Buffer.from(publicKey, 'hex')), taken from https://github.com/TezTech/eztz/blob/master/src/main.js line 66
    const payload = nacl.hash(Buffer.from(publicKey, 'hex')).slice(0, 20)

    const n = new Uint8Array(this.tezosPrefixes.tz1.length + payload.length)
    n.set(this.tezosPrefixes.tz1)
    n.set(payload, this.tezosPrefixes.tz1.length)

    return bs58check.encode(Buffer.from(n))
  }

  async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return this.getTransactionsFromAddresses([this.getAddressFromPublicKey(publicKey)], limit, offset)
  }

  async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    /*
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
    */
    return Promise.resolve([])
  }

  // TODO Not implemented yet, see https://github.com/kukai-wallet/kukai/blob/master/src/app/services/operation.service.ts line 462 it requires libsodium
  signWithPrivateKey(privateKey: Buffer, transaction: RawTezosTransaction): Promise<IAirGapSignedTransaction> {
    const watermark = '03'
    const watermarkedForgedOperationBytesHex: string = watermark + transaction.binaryTransaction
    const watermarkedForgedOperationBytes: Buffer = Buffer.from(watermarkedForgedOperationBytesHex, 'hex')
    const hashedWatermarkedOpBytes: Buffer = Buffer.from(nacl.hash(watermarkedForgedOperationBytes).slice(0, 32))

    const opSignature = nacl.sign.detached(hashedWatermarkedOpBytes, privateKey)

    const prefix = Buffer.from('edsig')
    const n = new Uint8Array(prefix.length + opSignature.length)
    n.set(prefix)
    n.set(opSignature, prefix.length)
    const hexSignature = bs58check.encode(Buffer.from(n))

    const signedOpBytes: Buffer = Buffer.concat([Buffer.from(transaction.binaryTransaction, 'hex'), opSignature])

    const tezosSignature: TezosTransaction = {
      transaction: transaction.jsonTransaction,
      bytes: signedOpBytes,
      signature: hexSignature.toString()
    }

    return Promise.resolve(tezosSignature)
  }

  // TODO Not implemented yet. The only difference between signed and unsigned is the "signature" property in the json object, see https://github.com/kukai-wallet/kukai/blob/master/src/app/services/operation.service.ts line 61
  getTransactionDetails(unsignedTx: UnsignedTezosTransaction): IAirGapTransaction {
    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(unsignedTx.transaction.jsonTransaction.contents[0].amount),
      fee: new BigNumber(unsignedTx.transaction.jsonTransaction.contents[0].fee),
      from: [unsignedTx.transaction.jsonTransaction.contents[0].source],
      isInbound: false,
      protocolIdentifier: this.identifier,
      to: [unsignedTx.transaction.jsonTransaction.contents[0].destination]
    }

    return airgapTx
  }

  // TODO Not implemented yet. The only difference between signed and unsigned is the "signature" property in the json object, see https://github.com/kukai-wallet/kukai/blob/master/src/app/services/operation.service.ts line 61
  getTransactionDetailsFromSigned(signedTx: SignedTezosTransaction): IAirGapTransaction {
    const airgapTx: IAirGapTransaction = {
      to: signedTx.from!, // TODO: Fix this
      protocolIdentifier: this.identifier,
      amount: signedTx.amount!,
      fee: signedTx.fee!,
      from: signedTx.from!,
      isInbound: true // TODO: Fix this
    }

    return airgapTx
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
  ): Promise<RawTezosTransaction> {
    let counter = new BigNumber(1)
    let branch: string

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${this.getAddressFromPublicKey(publicKey)}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`)
      ])
      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data
    } catch (error) {
      throw error
    }

    const balance = await this.getBalanceOfPublicKey(publicKey)

    if (balance.isLessThan(fee)) {
      throw new Error('not enough balance')
    }

    const operation: TezosOperation = {
      kind: TezosOperationType.TRANSACTION,
      fee: fee.toFixed(),
      gas_limit: '10100', // taken from eztz
      storage_limit: '0', // taken from eztz
      amount: values[0].toFixed(),
      counter: counter.toFixed(),
      protocol: this.tezosChainId,
      destination: recipients[0],
      source: this.getAddressFromPublicKey(publicKey)
    }

    try {
      const { data: forgedOperation } = await axios.post(`${this.jsonRPCAPI}/chains/main/blocks/head/helpers/forge/operations`)
      return {
        jsonTransaction: {
          branch: branch,
          contents: [operation]
        },
        binaryTransaction: forgedOperation
      }
    } catch (error) {
      throw new Error('Forging Tezos TX failed.')
    }
  }

  async broadcastTransaction(rawTransaction: string): Promise<any> {
    /*
    const { header } = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/header`)
    const { data } = await axios.post(
      `${this.jsonRPCAPI}/chains/${this.tezosChainId}/blocks/${header}/helpers/forge/operations`,
      {
        branch: header,
        contents: JSON.parse(rawTransaction) // tezos uses json based txs...
      },
      { headers: { 'Content-Type': 'application/json' } }
    )

    node.query('/chains/' + head.chain_id + '/blocks/' + head.hash + '/helpers/forge/operations', opOb)
    return data.tx_hash
    */
    return Promise.resolve()
  }

  getExtendedPrivateKeyFromHexSecret(secret: string, derivationPath: string): string {
    throw new Error('extended private key support for Tezos not implemented')
  }

  getBalanceOfExtendedPublicKey(extendedPublicKey: string, offset: number): Promise<BigNumber> {
    return Promise.reject('extended public balance for Tezos not implemented')
  }

  signWithExtendedPrivateKey(extendedPrivateKey: string, transaction: any): Promise<string> {
    return Promise.reject('extended private key signing for Tezos not implemented')
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
  ): Promise<RawTezosTransaction> {
    return Promise.reject('extended public tx for aeternity not implemented')
  }
}
