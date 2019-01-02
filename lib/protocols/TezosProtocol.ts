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
import * as sodium from 'libsodium-wrappers'

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
  standardDerivationPath = `m/44h/1729h/0h/0h`
  addressValidationPattern = '^tz1[1-9A-Za-z]{33}$'

  // Tezos
  private tezosPrefixes = {
    tz1: new Uint8Array([6, 161, 159]),
    tz2: new Uint8Array([6, 161, 161]),
    tz3: new Uint8Array([6, 161, 164]),
    edpk: new Uint8Array([13, 15, 37, 217]),
    edsk: new Uint8Array([43, 246, 78, 7]),
    edsig: new Uint8Array([9, 245, 205, 134, 18])
  }

  protected tezosChainId = 'PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP'

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
    // using libsodium for now
    const payload = sodium.crypto_generichash(20, Buffer.from(publicKey, 'hex'))
    const address = bs58check.encode(Buffer.concat([this.tezosPrefixes.tz1, payload]))

    return address
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
    const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes)

    const opSignature = nacl.sign.detached(hashedWatermarkedOpBytes, privateKey)
    const hexSignature = bs58check.encode(Buffer.concat([this.tezosPrefixes.edsig, Buffer.from(opSignature)]))
    const signedOpBytes: Buffer = Buffer.concat([Buffer.from(transaction.binaryTransaction, 'hex'), opSignature])

    const tezosSignature: TezosTransaction = {
      transaction: transaction.jsonTransaction,
      bytes: signedOpBytes,
      signature: hexSignature
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
      destination: recipients[0],
      source: this.getAddressFromPublicKey(publicKey)
    }

    try {
      const jsonTransaction = {
        branch: branch,
        contents: [operation]
      }
      const { data: forgedOperation } = await axios.post(
        `${this.jsonRPCAPI}/chains/main/blocks/head/helpers/forge/operations`,
        jsonTransaction,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
      return {
        jsonTransaction: jsonTransaction,
        binaryTransaction: forgedOperation
      }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  async broadcastTransaction(rawTransaction: TezosTransaction): Promise<any> {
    try {
      const { data: preApplyResponse } = await axios.post(`${this.jsonRPCAPI}/chains/main/blocks/head/helpers/preapply/operations`, [
        rawTransaction.bytes
      ])
      const { data: injectionResponse } = await axios.post(`${this.jsonRPCAPI}/injection/operation`, rawTransaction.signature)

      // returns hash if successful
      return injectionResponse
    } catch (err) {
      console.warn(err)
      throw new Error('broadcasting failed')
    }
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
