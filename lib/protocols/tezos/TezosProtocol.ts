import { ICoinProtocol } from '../ICoinProtocol'
import BigNumber from 'bignumber.js'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import * as nacl from 'tweetnacl'
import { generateWalletUsingDerivationPath } from '@aeternity/hd-wallet'
import axios, { AxiosError, AxiosResponse } from 'axios'
import * as bs58check from 'bs58check'
import { RawTezosTransaction, UnsignedTezosTransaction } from '../../serializer/unsigned-transactions/tezos-transactions.serializer'
import { SignedTezosTransaction } from '../../serializer/signed-transactions/tezos-transactions.serializer'
import * as sodium from 'libsodium-wrappers'
import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { NonExtendedProtocol } from '../NonExtendedProtocol'

export enum TezosOperationType {
  TRANSACTION = 'transaction',
  REVEAL = 'reveal'
}

export interface TezosBlockMetadata {
  protocol: string
  chain_id: string
  hash: string
  metadata: TezosBlockHeader
}

export interface TezosBlockHeader {
  level: number
  proto: number
  predecessor: string
  timestamp: string
  validation_pass: number
  operations_hash: string
  fitness: string[]
  context: string
  priority: number
  proof_of_work_nonce: string
  signature: string
}

export interface TezosWrappedOperation {
  branch: string
  contents: TezosOperation[]
}

export interface TezosSpendOperation extends TezosOperation {
  destination: string
  amount: string
  kind: TezosOperationType.TRANSACTION
}

export interface TezosOperation {
  storage_limit: string
  gas_limit: string
  counter: string
  fee: string
  source: string
  kind: TezosOperationType
}

export interface TezosRevealOperation extends TezosOperation {
  public_key: string
  kind: TezosOperationType.REVEAL
}

export class TezosProtocol extends NonExtendedProtocol implements ICoinProtocol {
  symbol = 'XTZ'
  name = 'Tezos (Beta)'
  marketSymbol = 'xtz'
  feeSymbol = 'xtz'

  decimals = 6
  feeDecimals = 6 // micro tez is the smallest, 1000000 microtez is 1 tez
  identifier = 'xtz'

  subProtocols = []

  // tezbox default
  feeDefaults = {
    low: new BigNumber('0.001420'),
    medium: new BigNumber('0.001520'),
    high: new BigNumber('0.003000')
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
  addressPlaceholder = 'tz1...'

  private addressInitializationFee = new BigNumber('0.257').shiftedBy(this.decimals)

  // Tezos - We need to wrap these in Buffer due to non-compatible browser polyfills
  private tezosPrefixes = {
    tz1: Buffer.from(new Uint8Array([6, 161, 159])),
    tz2: Buffer.from(new Uint8Array([6, 161, 161])),
    tz3: Buffer.from(new Uint8Array([6, 161, 164])),
    kt: Buffer.from(new Uint8Array([2, 90, 121])),
    edpk: Buffer.from(new Uint8Array([13, 15, 37, 217])),
    edsk: Buffer.from(new Uint8Array([43, 246, 78, 7])),
    edsig: Buffer.from(new Uint8Array([9, 245, 205, 134, 18])),
    branch: Buffer.from(new Uint8Array([1, 52]))
  }

  protected tezosChainId = 'PsddFKi32cMJ2qPjf43Qv5GDWLDPZb3T3bF6fLKiF5HtvHNU7aP'

  /**
   * Tezos Implemention of ICoinProtocol
   * @param jsonRPCAPI
   * @param baseApiUrl
   */
  constructor(public jsonRPCAPI = 'https://rpc.tezrpc.me', public baseApiUrl = 'https://api6.tzscan.io') {
    super()
  }

  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    // both AE and Tezos use the same ECC curves (ed25519)
    const { publicKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)
    return Buffer.from(publicKey).toString('hex')
  }

  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    // both AE and Tezos use the same ECC curves (ed25519)
    const { secretKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)
    return Buffer.from(secretKey)
  }

  getAddressFromPublicKey(publicKey: string): string {
    // using libsodium for now
    const payload = sodium.crypto_generichash(20, Buffer.from(publicKey, 'hex'))
    const address = bs58check.encode(Buffer.concat([this.tezosPrefixes.tz1, Buffer.from(payload)]))

    return address
  }

  async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    return this.getTransactionsFromAddresses([this.getAddressFromPublicKey(publicKey)], limit, offset)
  }

  private getPageNumber(limit: number, offset: number): number {
    if (limit <= 0 || offset < 0) {
      return 0
    }
    return Math.floor(offset / limit) // we need +1 here because pages start at 1
  }

  async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const page = this.getPageNumber(limit, offset)

    const allTransactions = await Promise.all(
      addresses.map(address => {
        return axios.get(`${this.baseApiUrl}/v3/operations/${address}?type=Transaction&p=${page}&number=${limit}`)
      })
    )

    const transactions: any[] = [].concat(
      ...allTransactions.map(axiosData => {
        return axiosData.data
      })
    )

    return transactions
      .map(obj => {
        return obj.type.operations.filter(operation => !operation.failed).map(operation => {
          const airGapTx: IAirGapTransaction = {
            amount: new BigNumber(operation.amount),
            fee: new BigNumber(operation.fee),
            from: [operation.src.tz],
            isInbound: addresses.indexOf(operation.destination.tz) !== -1,
            protocolIdentifier: this.identifier,
            to: [operation.destination.tz],
            hash: obj.hash,
            timestamp: new Date(operation.timestamp).getTime() / 1000, // make sure its a unix timestamp
            blockHeight: operation.op_level // TODO show correct height
          }

          return airGapTx
        })
      })
      .reduce((previous: any[], current: any[]) => {
        previous.push(...current)
        return previous
      }, [])
  }

  signWithPrivateKey(privateKey: Buffer, transaction: RawTezosTransaction): Promise<IAirGapSignedTransaction> {
    const watermark = '03'
    const watermarkedForgedOperationBytesHex: string = watermark + transaction.binaryTransaction
    const watermarkedForgedOperationBytes: Buffer = Buffer.from(watermarkedForgedOperationBytesHex, 'hex')
    const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes)

    const opSignature = nacl.sign.detached(hashedWatermarkedOpBytes, privateKey)
    const signedOpBytes: Buffer = Buffer.concat([Buffer.from(transaction.binaryTransaction, 'hex'), Buffer.from(opSignature)])

    return Promise.resolve(signedOpBytes.toString('hex'))
  }

  getTransactionDetails(unsignedTx: UnsignedTezosTransaction): IAirGapTransaction {
    const binaryTransaction = unsignedTx.transaction.binaryTransaction
    const wrappedOperations = this.unforgeUnsignedTezosWrappedOperation(binaryTransaction)

    return this.getAirGapTxFromWrappedOperations(wrappedOperations)
  }

  getTransactionDetailsFromSigned(signedTx: SignedTezosTransaction): IAirGapTransaction {
    const binaryTransaction = signedTx.transaction
    const wrappedOperations = this.unforgeSignedTezosWrappedOperation(binaryTransaction)

    return this.getAirGapTxFromWrappedOperations(wrappedOperations)
  }

  private getAirGapTxFromWrappedOperations(wrappedOperations: TezosWrappedOperation) {
    const spendOperation = wrappedOperations.contents.find(content => content.kind === TezosOperationType.TRANSACTION)
    if (!spendOperation) {
      throw new Error('No spend transaction found')
    }
    const spendTransaction: TezosSpendOperation = spendOperation as TezosSpendOperation

    const airgapTx: IAirGapTransaction = {
      amount: new BigNumber(spendTransaction.amount),
      fee: new BigNumber(spendTransaction.fee),
      from: [spendTransaction.source],
      isInbound: false,
      protocolIdentifier: this.identifier,
      to: [spendTransaction.destination]
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

    const operations: TezosOperation[] = []

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${this.getAddressFromPublicKey(publicKey)}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${this.getAddressFromPublicKey(publicKey)}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager = results[2].data

      // check if we have revealed the key already
      if (!accountManager.key) {
        operations.push(this.createRevealOperation(counter, publicKey))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const balance = await this.getBalanceOfPublicKey(publicKey)
    const receivingBalance = await this.getBalanceOfAddresses(recipients)

    // if our receiver has 0 balance, the account is not activated yet.
    if (receivingBalance.isZero()) {
      // We have to supply an additional 0.257 XTZ fee for storage_limit costs, which gets automatically deducted from the sender so we just have to make sure enough balance is around
      // check whether the sender has enough to cover the amount to send + fee + initialization
      if (balance.isLessThan(values[0].plus(fee).plus(this.addressInitializationFee))) {
        // if not, make room for the init fee
        values[0] = values[0].minus(this.addressInitializationFee) // deduct fee from balance
      }
    }

    if (balance.isLessThan(values[0].plus(fee))) {
      throw new Error('not enough balance')
    }

    const spendOperation: TezosSpendOperation = {
      kind: TezosOperationType.TRANSACTION,
      fee: fee.toFixed(),
      gas_limit: '10100', // taken from eztz
      storage_limit: receivingBalance.isZero() ? '300' : '0', // taken from eztz
      amount: values[0].toFixed(),
      counter: counter.toFixed(),
      destination: recipients[0],
      source: this.getAddressFromPublicKey(publicKey)
    }

    operations.push(spendOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch: branch,
        contents: operations
      }

      const binaryTx = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  async broadcastTransaction(rawTransaction: IAirGapSignedTransaction): Promise<string> {
    const payload = rawTransaction

    try {
      const { data: injectionResponse } = await axios.post(`${this.jsonRPCAPI}/injection/operation?chain=main`, JSON.stringify(payload), {
        headers: { 'content-type': 'application/json' }
      })
      // returns hash if successful
      return injectionResponse
    } catch (err) {
      console.warn((err as AxiosError).message, ((err as AxiosError).response as AxiosResponse).statusText)
      throw new Error('broadcasting failed')
    }
  }

  checkAndRemovePrefixToHex(base58CheckEncodedPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex = Buffer.from(tezosPrefix).toString('hex')
    const payload = bs58check.decode(base58CheckEncodedPayload).toString('hex')
    if (payload.startsWith(prefixHex)) {
      return payload.substring(tezosPrefix.length * 2)
    } else {
      throw new Error('payload did not match prefix: ' + prefixHex)
    }
  }

  prefixAndBase58CheckEncode(hexStringPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex = Buffer.from(tezosPrefix).toString('hex')
    return bs58check.encode(new Buffer(prefixHex + hexStringPayload, 'hex'))
  }

  splitAndReturnRest(payload: string, length: number): { result: string; rest: string } {
    const result = payload.substr(0, length)
    const rest = payload.substr(length, payload.length - length)
    return { result: result, rest: rest }
  }

  parseAddress(rawHexAddress: string): string {
    let { result, rest } = this.splitAndReturnRest(rawHexAddress, 2)
    const contractIdTag = result
    if (contractIdTag === '00') {
      // tz1 address
      ;({ result, rest } = this.splitAndReturnRest(rest, 2))
      const publicKeyHashTag = result
      if (publicKeyHashTag === '00') {
        return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.tz1)
      } else {
        throw new Error('address format not supported')
      }
    } else if (contractIdTag === '01') {
      // kt address
      return this.prefixAndBase58CheckEncode(rest.slice(0, -2), this.tezosPrefixes.kt)
    } else {
      throw new Error('address format not supported')
    }
  }

  parsePublicKey(rawHexPublicKey: string): string {
    let { result, rest } = this.splitAndReturnRest(rawHexPublicKey, 2)
    const tag = result
    if (tag === '00') {
      // tz1 address
      return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.edpk)
    } else {
      throw new Error('public key format not supported')
    }
  }

  unforgeSignedTezosWrappedOperation(hexString: string): TezosWrappedOperation {
    if (hexString.length <= 128) {
      throw new Error('Not a valid signed transaction')
    }
    return this.unforgeUnsignedTezosWrappedOperation(hexString.substring(0, hexString.length - 128))
  }

  unforgeUnsignedTezosWrappedOperation(hexString: string): TezosWrappedOperation {
    let { result, rest } = this.splitAndReturnRest(hexString, 64)
    const branch = this.prefixAndBase58CheckEncode(result, this.tezosPrefixes.branch)

    let tezosWrappedOperation: TezosWrappedOperation = {
      branch: branch,
      contents: []
    }

    while (rest.length > 0) {
      ;({ result, rest } = this.splitAndReturnRest(rest, 2))
      const kindHexString = result
      if (kindHexString === '08') {
        let tezosSpendOperation: TezosSpendOperation
        ;({ tezosSpendOperation, rest } = this.unforgeSpendOperation(rest))
        tezosWrappedOperation.contents.push(tezosSpendOperation)
      } else if (kindHexString === '07') {
        let tezosRevealOperation: TezosRevealOperation
        ;({ tezosRevealOperation, rest } = this.unforgeRevealOperation(rest))
        tezosWrappedOperation.contents.push(tezosRevealOperation)
      } else {
        throw new Error('transaction operation unknown')
      }
    }
    return tezosWrappedOperation
  }

  unforgeRevealOperation(hexString: string): { tezosRevealOperation: TezosRevealOperation; rest: string } {
    let { result, rest } = this.splitAndReturnRest(hexString, 44)
    const source = this.parseAddress(result)
    // fee, counter, gas_limit, storage_limit
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const fee = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const counter = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const gasLimit = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const storageLimit = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, 66))
    const publicKey = this.parsePublicKey(result)

    return {
      tezosRevealOperation: {
        kind: TezosOperationType.REVEAL,
        fee: fee.toFixed(),
        gas_limit: gasLimit.toFixed(),
        storage_limit: storageLimit.toFixed(),
        counter: counter.toFixed(),
        public_key: publicKey,
        source: source
      },
      rest: rest
    }
  }

  unforgeSpendOperation(hexString: string): { tezosSpendOperation: TezosSpendOperation; rest: string } {
    let { result, rest } = this.splitAndReturnRest(hexString, 44)
    const source = this.parseAddress(result)

    // fee, counter, gas_limit, storage_limit, amount
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const fee = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const counter = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const gasLimit = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const storageLimit = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const amount = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, 44))
    const destination = this.parseAddress(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, 2))
    const hasParameters = result

    if (hasParameters !== '00') {
      throw new Error('spend transaction parser does not support parameters yet')
    }

    return {
      tezosSpendOperation: {
        kind: TezosOperationType.TRANSACTION,
        fee: fee.toFixed(),
        gas_limit: gasLimit.toFixed(),
        storage_limit: storageLimit.toFixed(),
        amount: amount.toFixed(),
        counter: counter.toFixed(),
        destination: destination,
        source: source
      },
      rest: rest
    }
  }

  forgeTezosOperation(tezosWrappedOperation: TezosWrappedOperation) {
    // taken from http://tezos.gitlab.io/mainnet/api/p2p.html
    const cleanedBranch = this.checkAndRemovePrefixToHex(tezosWrappedOperation.branch, this.tezosPrefixes.branch) // ignore the tezos prefix
    if (cleanedBranch.length !== 64) {
      // must be 32 bytes
      throw new Error('provided branch is invalid')
    }

    let branchHexString = cleanedBranch // ignore the tezos prefix

    const forgedOperation = tezosWrappedOperation.contents.map(operation => {
      let resultHexString = ''
      if (operation.kind !== TezosOperationType.TRANSACTION && operation.kind !== TezosOperationType.REVEAL) {
        throw new Error('currently unsupported operation type supplied ' + operation.kind)
      }

      if (operation.kind === TezosOperationType.TRANSACTION) {
        resultHexString += '08' // because this is a transaction operation
      } else if (operation.kind === TezosOperationType.REVEAL) {
        resultHexString += '07' // because this is a reveal operation
      }

      let cleanedSource = this.checkAndRemovePrefixToHex(operation.source, this.tezosPrefixes.tz1) // currently we only support tz1 addresses
      if (cleanedSource.length > 44) {
        // must be less or equal 22 bytes
        throw new Error('provided source is invalid')
      }

      while (cleanedSource.length !== 44) {
        // fill up with 0s to match 22bytes
        cleanedSource = '0' + cleanedSource
      }

      resultHexString += cleanedSource
      resultHexString += this.bigNumberToZarith(new BigNumber(operation.fee))
      resultHexString += this.bigNumberToZarith(new BigNumber(operation.counter))
      resultHexString += this.bigNumberToZarith(new BigNumber(operation.gas_limit))
      resultHexString += this.bigNumberToZarith(new BigNumber(operation.storage_limit))

      if (operation.kind === TezosOperationType.TRANSACTION) {
        resultHexString += this.bigNumberToZarith(new BigNumber((operation as TezosSpendOperation).amount))

        let cleanedDestination

        if ((operation as TezosSpendOperation).destination.toLowerCase().startsWith('kt')) {
          cleanedDestination =
            '01' + this.checkAndRemovePrefixToHex((operation as TezosSpendOperation).destination, this.tezosPrefixes.kt) + '00'
        } else {
          cleanedDestination = this.checkAndRemovePrefixToHex((operation as TezosSpendOperation).destination, this.tezosPrefixes.tz1)
        }

        if (cleanedDestination.length > 44) {
          // must be less or equal 22 bytes
          throw new Error('provided destination is invalid')
        }

        while (cleanedDestination.length !== 44) {
          // fill up with 0s to match 22bytes
          cleanedDestination = '0' + cleanedDestination
        }

        resultHexString += cleanedDestination

        resultHexString += '00' // because we have no additional parameters
      }

      if (operation.kind === TezosOperationType.REVEAL) {
        let cleanedPublicKey = this.checkAndRemovePrefixToHex((operation as TezosRevealOperation).public_key, this.tezosPrefixes.edpk)

        if (cleanedPublicKey.length === 32) {
          // must be equal 32 bytes
          throw new Error('provided public key is invalid')
        }

        resultHexString += '00' + cleanedPublicKey
      }

      return resultHexString
    })

    return branchHexString + forgedOperation.join('')
  }

  bigNumberToZarith(inputNumber: BigNumber) {
    let bitString = inputNumber.toString(2)
    while (bitString.length % 7 !== 0) {
      bitString = '0' + bitString // fill up with leading '0'
    }

    let resultHexString = ''
    // because it's little endian we start from behind...
    for (let i = bitString.length; i > 0; i -= 7) {
      let bitStringSection = bitString.substring(i - 7, i)
      if (i === 7) {
        // the last byte will show it's the last with a leading '0'
        bitStringSection = '0' + bitStringSection
      } else {
        // the others will show more will come with a leading '1'
        bitStringSection = '1' + bitStringSection
      }
      let hexStringSection = parseInt(bitStringSection, 2).toString(16)

      if (hexStringSection.length % 2) {
        hexStringSection = '0' + hexStringSection
      }

      resultHexString += hexStringSection
    }
    return resultHexString
  }

  findZarithEndIndex(hexString: string) {
    for (let i = 0; i < hexString.length; i += 2) {
      const byteSection = hexString.substr(i, 2)
      if (parseInt(byteSection, 16).toString(2).length !== 8) {
        return i + 2
      }
    }
    throw new Error('provided hex string is not Zarith encoded')
  }

  zarithToBigNumber(hexString: string) {
    let bitString = ''
    for (let i = 0; i < hexString.length; i += 2) {
      const byteSection = hexString.substr(i, 2)
      const bitSection = ('00000000' + parseInt(byteSection, 16).toString(2)).substr(-7)
      bitString = bitSection + bitString
    }
    return new BigNumber(bitString, 2)
  }

  private createRevealOperation(counter: BigNumber, publicKey: string): TezosRevealOperation {
    const operation: TezosRevealOperation = {
      kind: TezosOperationType.REVEAL,
      fee: '1300',
      gas_limit: '10000', // taken from conseiljs
      storage_limit: '0', // taken from conseiljs
      counter: counter.toFixed(),
      public_key: bs58check.encode(Buffer.concat([this.tezosPrefixes.edpk, Buffer.from(publicKey, 'hex')])),
      source: this.getAddressFromPublicKey(publicKey)
    }
    return operation
  }
}
