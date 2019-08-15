import { generateWalletUsingDerivationPath } from '@aeternity/hd-wallet'
import axios, { AxiosError, AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import * as bs58check from 'bs58check'
import * as sodium from 'libsodium-wrappers'

import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { SignedTezosTransaction } from '../../serializer/signed-transactions/tezos-transactions.serializer'
import { RawTezosTransaction, UnsignedTezosTransaction } from '../../serializer/unsigned-transactions/tezos-transactions.serializer'
import { getSubProtocolsByIdentifier } from '../../utils/subProtocols'
import { ICoinProtocol } from '../ICoinProtocol'
import { NonExtendedProtocol } from '../NonExtendedProtocol'

export enum TezosOperationType {
  TRANSACTION = 'transaction',
  REVEAL = 'reveal',
  ORIGINATION = 'origination',
  DELEGATION = 'delegation'
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

export interface TezosDelegationOperation extends TezosOperation {
  kind: TezosOperationType.DELEGATION
  source: string
  fee: string
  counter: string
  gas_limit: string
  storage_limit: string
  delegate?: string
}
export interface TezosOriginationOperation extends TezosOperation {
  kind: TezosOperationType.ORIGINATION
  balance: string
  counter: string
  delegatable: boolean
  fee: string
  gas_limit: string
  manager_pubkey: string
  source: string
  spendable: boolean
  storage_limit: string
  delegate?: string
  script?: string
}
export interface TezosRevealOperation extends TezosOperation {
  public_key: string
  kind: TezosOperationType.REVEAL
}

export interface TezosOperation {
  storage_limit: string
  gas_limit: string
  counter: string
  fee: string
  source: string
  kind: TezosOperationType
}

export class TezosProtocol extends NonExtendedProtocol implements ICoinProtocol {
  public symbol = 'XTZ'
  public name = 'Tezos'
  public marketSymbol = 'xtz'
  public feeSymbol = 'xtz'

  public decimals = 6
  public feeDecimals = 6 // micro tez is the smallest, 1000000 microtez is 1 tez
  public identifier = 'xtz'

  get subProtocols() {
    return getSubProtocolsByIdentifier(this.identifier)
  }

  // tezbox default
  public feeDefaults = {
    low: new BigNumber('0.001420'),
    medium: new BigNumber('0.001520'),
    high: new BigNumber('0.003000')
  }

  public units = [
    {
      unitSymbol: 'XTZ',
      factor: new BigNumber(1)
    }
  ]

  public supportsHD = false
  public standardDerivationPath = `m/44h/1729h/0h/0h`

  public addressIsCaseSensitive = true
  public addressValidationPattern = '^(tz1|KT1)[1-9A-Za-z]{33}$'
  public addressPlaceholder = 'tz1...'

  public blockExplorer = 'https://tzscan.io'

  protected readonly transactionFee = new BigNumber('1400')
  protected readonly originationSize = new BigNumber('257')
  protected readonly storageCostPerByte = new BigNumber('1000')

  protected readonly revealFee = new BigNumber('1300')
  protected readonly activationBurn = this.originationSize.times(this.storageCostPerByte)
  protected readonly originationBurn = this.originationSize.times(this.storageCostPerByte) // https://tezos.stackexchange.com/a/787

  // Tezos - We need to wrap these in Buffer due to non-compatible browser polyfills
  private readonly tezosPrefixes = {
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
  constructor(public jsonRPCAPI = 'https://mainnet.tezrpc.me', public baseApiUrl = 'https://api6.tzscan.io') {
    super()
  }

  public getBlockExplorerLinkForAddress(address: string): string {
    return `${this.blockExplorer}/{{address}}`.replace('{{address}}', address)
  }

  public getBlockExplorerLinkForTxId(txId: string): string {
    return `${this.blockExplorer}/{{txId}}`.replace('{{txId}}', txId)
  }

  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  public getPublicKeyFromHexSecret(secret: string, derivationPath: string): string {
    // both AE and Tezos use the same ECC curves (ed25519)
    const { publicKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)
    return Buffer.from(publicKey).toString('hex')
  }

  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  public getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    // both AE and Tezos use the same ECC curves (ed25519)
    const { secretKey } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)
    return Buffer.from(secretKey)
  }

  public async getAddressFromPublicKey(publicKey: string): Promise<string> {
    // using libsodium for now
    await sodium.ready
    const payload = sodium.crypto_generichash(20, Buffer.from(publicKey, 'hex'))
    const address = bs58check.encode(Buffer.concat([this.tezosPrefixes.tz1, Buffer.from(payload)]))

    return address
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return [address]
  }

  public async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const addresses = await this.getAddressesFromPublicKey(publicKey)
    return this.getTransactionsFromAddresses(addresses, limit, offset)
  }

  private getPageNumber(limit: number, offset: number): number {
    if (limit <= 0 || offset < 0) {
      return 0
    }
    return Math.floor(offset / limit) // we need +1 here because pages start at 1
  }

  public async getTransactionsFromAddresses(addresses: string[], limit: number, offset: number): Promise<IAirGapTransaction[]> {
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

  public async signWithPrivateKey(privateKey: Buffer, transaction: RawTezosTransaction): Promise<IAirGapSignedTransaction> {
    const watermark = '03'
    const watermarkedForgedOperationBytesHex: string = watermark + transaction.binaryTransaction
    const watermarkedForgedOperationBytes: Buffer = Buffer.from(watermarkedForgedOperationBytesHex, 'hex')
    const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes)

    await sodium.ready
    const opSignature = sodium.crypto_sign_detached(hashedWatermarkedOpBytes, privateKey)
    const signedOpBytes: Buffer = Buffer.concat([Buffer.from(transaction.binaryTransaction, 'hex'), Buffer.from(opSignature)])

    return signedOpBytes.toString('hex')
  }

  public async getTransactionDetails(unsignedTx: UnsignedTezosTransaction): Promise<IAirGapTransaction> {
    const binaryTransaction = unsignedTx.transaction.binaryTransaction
    const wrappedOperations = this.unforgeUnsignedTezosWrappedOperation(binaryTransaction)

    return this.getAirGapTxFromWrappedOperations(wrappedOperations)
  }

  public async getTransactionDetailsFromSigned(signedTx: SignedTezosTransaction): Promise<IAirGapTransaction> {
    const binaryTransaction = signedTx.transaction
    const wrappedOperations = this.unforgeSignedTezosWrappedOperation(binaryTransaction)

    return this.getAirGapTxFromWrappedOperations(wrappedOperations)
  }

  private getAirGapTxFromWrappedOperations(wrappedOperations: TezosWrappedOperation) {
    const tezosOperation: TezosOperation = wrappedOperations.contents[wrappedOperations.contents.length - 1]

    let amount = new BigNumber(0)
    let to = ['']

    if (tezosOperation.kind === TezosOperationType.TRANSACTION) {
      amount = new BigNumber((tezosOperation as TezosSpendOperation).amount)
      to = [(tezosOperation as TezosSpendOperation).destination]
    } else if (tezosOperation.kind === TezosOperationType.ORIGINATION) {
      const tezosOriginationOperation = tezosOperation as TezosOriginationOperation
      amount = new BigNumber(tezosOriginationOperation.balance)
      const delegate = tezosOriginationOperation.delegate
      to = [delegate ? `Delegate: ${delegate}` : 'Origination']
    } else if (tezosOperation.kind === TezosOperationType.DELEGATION) {
      const delegate = (tezosOperation as TezosDelegationOperation).delegate
      to = [delegate ? delegate : 'Undelegate']
    } else {
      throw new Error('no operation to unforge found')
    }

    const airgapTx: IAirGapTransaction = {
      amount,
      fee: new BigNumber(tezosOperation.fee),
      from: [tezosOperation.source],
      isInbound: false,
      protocolIdentifier: this.identifier,
      to
    }

    return airgapTx
  }

  public async getBalanceOfAddresses(addresses: string[]): Promise<BigNumber> {
    let balance = new BigNumber(0)

    for (const address of addresses) {
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

  public async getBalanceOfPublicKey(publicKey: string): Promise<BigNumber> {
    const address = await this.getAddressFromPublicKey(publicKey)
    return this.getBalanceOfAddresses([address])
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
    let counter = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []

    // check if we got an address-index
    const addressIndex = data && data.addressIndex ? data.addressIndex : 0
    const addresses = await this.getAddressesFromPublicKey(publicKey)

    if (!addresses[addressIndex]) {
      throw new Error('no kt-address with this index exists')
    }

    const address = addresses[addressIndex]

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager = results[2].data

      // check if we have revealed the address already
      if (!accountManager.key) {
        operations.push(await this.createRevealOperation(counter, publicKey, address))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const balance = await this.getBalanceOfPublicKey(publicKey)
    const receivingBalance = await this.getBalanceOfAddresses(recipients)

    const amountUsedByPreviousOperations = this.getAmountUsedByPreviousOperations(operations)

    if (!amountUsedByPreviousOperations.isZero()) {
      if (balance.isLessThan(values[0].plus(fee).plus(amountUsedByPreviousOperations))) {
        // if not, make room for the init fee
        values[0] = values[0].minus(amountUsedByPreviousOperations) // deduct fee from balance
      }
    }

    // if our receiver has 0 balance, the account is not activated yet.
    if (receivingBalance.isZero() && recipients[0].toLowerCase().startsWith('tz')) {
      // We have to supply an additional 0.257 XTZ fee for storage_limit costs, which gets automatically deducted from the sender so we just have to make sure enough balance is around
      // check whether the sender has enough to cover the amount to send + fee + activation
      if (balance.isLessThan(values[0].plus(fee).plus(this.activationBurn))) {
        // if not, make room for the init fee
        values[0] = values[0].minus(this.activationBurn) // deduct fee from balance
      }
    }

    if (balance.isEqualTo(values[0].plus(fee))) {
      // Tezos accounts can never be empty. If user tries to send everything, we must leave 1 mutez behind.
      values[0] = values[0].minus(1)
    } else if (balance.isLessThan(values[0].plus(fee))) {
      throw new Error('not enough balance')
    }

    const spendOperation: TezosSpendOperation = {
      kind: TezosOperationType.TRANSACTION,
      fee: fee.toFixed(),
      gas_limit: '10300', // taken from eztz
      storage_limit: receivingBalance.isZero() && recipients[0].toLowerCase().startsWith('tz') ? '300' : '0', // taken from eztz
      amount: values[0].toFixed(),
      counter: counter.toFixed(),
      destination: recipients[0],
      source: address
    }

    operations.push(spendOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch,
        contents: operations
      }

      const binaryTx = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  /**
   * If the delegate is set and amount is not set, the whole balance will be sent to the KT address.
   *
   * @param publicKey Public key of tezos account
   * @param delegate The address of the account where you want to delegate the newly originated KT address
   * @param amount The amount of tezzies to be transferred to the newly originated KT address
   */
  public async originate(publicKey: string, delegate?: string, amount?: BigNumber): Promise<RawTezosTransaction> {
    let counter = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []
    const address = await this.getAddressFromPublicKey(publicKey)

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager = results[2].data

      // check if we have revealed the key already
      if (!accountManager.key) {
        operations.push(await this.createRevealOperation(counter, publicKey, address))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const balance = await this.getBalanceOfAddresses([address])

    const amountUsedByPreviousOperations = this.getAmountUsedByPreviousOperations(operations)

    const combinedAmountsAndFees = this.transactionFee
      .plus(amountUsedByPreviousOperations)
      .plus(this.originationBurn)
      .plus(1)

    let balanceToSend = new BigNumber(0)

    if (delegate) {
      balanceToSend = balance // If delegate is set, by default we send the whole balance
    }

    if (amount && amount.isLessThan(balance)) {
      balanceToSend = amount // If amount is set and valid, we override
    }

    const maxAmount = balance.minus(combinedAmountsAndFees)

    balanceToSend = BigNumber.min(balanceToSend, maxAmount)

    if (balance.isLessThan(balanceToSend.plus(combinedAmountsAndFees))) {
      throw new Error('not enough balance')
    }

    const originationOperation: TezosOriginationOperation = {
      kind: TezosOperationType.ORIGINATION,
      source: address,
      fee: this.transactionFee.toFixed(),
      counter: counter.toFixed(),
      gas_limit: '10000', // taken from eztz
      storage_limit: this.originationSize.toFixed(),
      manager_pubkey: address,
      balance: balanceToSend.toFixed(),
      spendable: true,
      delegatable: true,
      delegate
    }

    operations.push(originationOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch,
        contents: operations
      }

      const binaryTx = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  private getAmountUsedByPreviousOperations(operations: TezosOperation[]): BigNumber {
    let amountUsed = new BigNumber(0)
    const assertNever = (x: never) => undefined

    operations.forEach(operation => {
      amountUsed = amountUsed.plus(operation.fee) // Fee has to be added for every operation type

      if (operation.kind === TezosOperationType.REVEAL) {
        // const revealOperation = operation as TezosRevealOperation
        // No additional amount/fee
      } else if (operation.kind === TezosOperationType.ORIGINATION) {
        const originationOperation = operation as TezosOriginationOperation
        amountUsed = amountUsed.plus(originationOperation.balance)
      } else if (operation.kind === TezosOperationType.DELEGATION) {
        // const delegationOperation = operation as TezosDelegationOperation
        // No additional amount/fee
      } else if (operation.kind === TezosOperationType.TRANSACTION) {
        const spendOperation = operation as TezosSpendOperation
        amountUsed = amountUsed.plus(spendOperation.amount)
      } else {
        assertNever(operation.kind) // Exhaustive if
      }
    })
    return amountUsed
  }

  public async broadcastTransaction(rawTransaction: IAirGapSignedTransaction): Promise<string> {
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

  protected checkAndRemovePrefixToHex(base58CheckEncodedPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex = Buffer.from(tezosPrefix).toString('hex')
    const payload = bs58check.decode(base58CheckEncodedPayload).toString('hex')
    if (payload.startsWith(prefixHex)) {
      return payload.substring(tezosPrefix.length * 2)
    } else {
      throw new Error('payload did not match prefix: ' + prefixHex)
    }
  }

  protected prefixAndBase58CheckEncode(hexStringPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex = Buffer.from(tezosPrefix).toString('hex')

    return bs58check.encode(Buffer.from(prefixHex + hexStringPayload, 'hex'))
  }

  protected splitAndReturnRest(payload: string, length: number): { result: string; rest: string } {
    const result = payload.substr(0, length)
    const rest = payload.substr(length, payload.length - length)

    return { result, rest }
  }

  protected parseAddress(rawHexAddress: string): string {
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

  protected parsePublicKey(rawHexPublicKey: string): string {
    const { result, rest } = this.splitAndReturnRest(rawHexPublicKey, 2)
    const tag = result
    if (tag === '00') {
      // tz1 address
      return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.edpk)
    } else {
      throw new Error('public key format not supported')
    }
  }

  public unforgeSignedTezosWrappedOperation(hexString: string): TezosWrappedOperation {
    if (hexString.length <= 128) {
      throw new Error('Not a valid signed transaction')
    }

    return this.unforgeUnsignedTezosWrappedOperation(hexString.substring(0, hexString.length - 128))
  }

  public unforgeUnsignedTezosWrappedOperation(hexString: string): TezosWrappedOperation {
    let { result, rest } = this.splitAndReturnRest(hexString, 64)
    const branch = this.prefixAndBase58CheckEncode(result, this.tezosPrefixes.branch)

    const tezosWrappedOperation: TezosWrappedOperation = {
      branch,
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
      } else if (kindHexString === '09') {
        let tezosOriginationOperation: TezosOriginationOperation
        ;({ tezosOriginationOperation, rest } = this.unforgeOriginationOperation(rest))
        tezosWrappedOperation.contents.push(tezosOriginationOperation)
      } else if (kindHexString === '0a') {
        let tezosDelegationOperation: TezosDelegationOperation
        ;({ tezosDelegationOperation, rest } = this.unforgeDelegationOperation(rest))
        tezosWrappedOperation.contents.push(tezosDelegationOperation)
      } else {
        throw new Error('transaction operation unknown')
      }
    }

    return tezosWrappedOperation
  }

  public unforgeRevealOperation(hexString: string): { tezosRevealOperation: TezosRevealOperation; rest: string } {
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
        source
      },
      rest
    }
  }

  public unforgeSpendOperation(hexString: string): { tezosSpendOperation: TezosSpendOperation; rest: string } {
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
        destination,
        source
      },
      rest
    }
  }

  public unforgeOriginationOperation(hexString: string): { tezosOriginationOperation: TezosOriginationOperation; rest: string } {
    let { result, rest } = this.splitAndReturnRest(hexString, 44) // slice of FF at beginning
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
    ;({ result, rest } = this.splitAndReturnRest(rest, 42))
    const managerPubKey = this.parseAddress('00' + result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const balance = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, 2))
    const spendable = result === 'ff' ? true : false
    ;({ result, rest } = this.splitAndReturnRest(rest, 2))
    const delegatable = result === 'ff' ? true : false
    ;({ result, rest } = this.splitAndReturnRest(rest, 2))
    const hasDelegate = result === 'ff' ? true : false
    let delegate
    if (hasDelegate) {
      // Delegate is optional
      ;({ result, rest } = this.splitAndReturnRest(rest, 42))
      delegate = this.parseAddress('00' + result)
    }
    ;({ result, rest } = this.splitAndReturnRest(rest, 2))
    const hasScript = result === 'ff' ? true : false
    let script
    if (hasScript) {
      // Script is optional
      ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
      script = this.zarithToBigNumber(result)
    }

    return {
      tezosOriginationOperation: {
        source,
        kind: TezosOperationType.ORIGINATION,
        fee: fee.toFixed(),
        gas_limit: gasLimit.toFixed(),
        storage_limit: storageLimit.toFixed(),
        counter: counter.toFixed(),
        balance: balance.toFixed(),
        manager_pubkey: managerPubKey,
        spendable,
        delegatable,
        delegate,
        script
      },
      rest
    }
  }

  public unforgeDelegationOperation(hexString: string): { tezosDelegationOperation: TezosDelegationOperation; rest: string } {
    let { result, rest } = this.splitAndReturnRest(hexString, 44) // slice of FF at beginning
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

    let delegate
    if (rest.length === 42) {
      ;({ result, rest } = this.splitAndReturnRest('01' + rest.slice(2), 42))
      delegate = this.parseAddress(result)
    } else if (rest.length > 42) {
      ;({ result, rest } = this.splitAndReturnRest('00' + rest.slice(2), 44))
      delegate = this.parseAddress(result)
    } else if (rest.length === 2 && rest === '00') {
      rest = ''
    }

    return {
      tezosDelegationOperation: {
        source,
        kind: TezosOperationType.DELEGATION,
        fee: fee.toFixed(),
        gas_limit: gasLimit.toFixed(),
        storage_limit: storageLimit.toFixed(),
        counter: counter.toFixed(),
        delegate: delegate ? delegate : undefined
      },
      rest
    }
  }

  public forgeTezosOperation(tezosWrappedOperation: TezosWrappedOperation) {
    // taken from http://tezos.gitlab.io/mainnet/api/p2p.html
    const cleanedBranch = this.checkAndRemovePrefixToHex(tezosWrappedOperation.branch, this.tezosPrefixes.branch) // ignore the tezos prefix
    if (cleanedBranch.length !== 64) {
      // must be 32 bytes
      throw new Error('provided branch is invalid')
    }

    const branchHexString = cleanedBranch // ignore the tezos prefix

    const forgedOperation = tezosWrappedOperation.contents.map(operation => {
      let resultHexString = ''

      if (
        operation.kind !== TezosOperationType.TRANSACTION &&
        operation.kind !== TezosOperationType.REVEAL &&
        operation.kind !== TezosOperationType.ORIGINATION &&
        operation.kind !== TezosOperationType.DELEGATION
      ) {
        throw new Error('currently unsupported operation type supplied ' + operation.kind)
      }

      // TAG
      if (operation.kind === TezosOperationType.TRANSACTION) {
        resultHexString += '08' // because this is a transaction operation
      } else if (operation.kind === TezosOperationType.REVEAL) {
        resultHexString += '07' // because this is a reveal operation
      } else if (operation.kind === TezosOperationType.ORIGINATION) {
        resultHexString += '09' // because this is a reveal operation
      } else if (operation.kind === TezosOperationType.DELEGATION) {
        resultHexString += '0a' // because this is a reveal operation
      }

      let cleanedSource: string

      if ((operation as TezosSpendOperation).source.toLowerCase().startsWith('kt')) {
        cleanedSource = '01' + this.checkAndRemovePrefixToHex(operation.source, this.tezosPrefixes.kt) + '00'
      } else {
        cleanedSource = this.checkAndRemovePrefixToHex(operation.source, this.tezosPrefixes.tz1)
      }

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
        const cleanedPublicKey = this.checkAndRemovePrefixToHex((operation as TezosRevealOperation).public_key, this.tezosPrefixes.edpk)

        if (cleanedPublicKey.length === 32) {
          // must be equal 32 bytes
          throw new Error('provided public key is invalid')
        }

        resultHexString += '00' + cleanedPublicKey
      }

      if (operation.kind === TezosOperationType.ORIGINATION) {
        const originationOperation = operation as TezosOriginationOperation

        const cleanedManagerPubKey = this.checkAndRemovePrefixToHex(originationOperation.manager_pubkey, this.tezosPrefixes.tz1)

        if (cleanedManagerPubKey.length === 32) {
          // must be equal 32 bytes
          throw new Error('provided public key is invalid')
        }

        resultHexString += '00' + cleanedManagerPubKey

        resultHexString += this.bigNumberToZarith(new BigNumber(originationOperation.balance))
        resultHexString += originationOperation.spendable ? 'ff' : '00'
        resultHexString += originationOperation.delegatable ? 'ff' : '00'

        if (originationOperation.delegate) {
          // PRESENCE OF DELEGATE
          resultHexString += 'ff'

          let cleanedDestination

          if (originationOperation.delegate.toLowerCase().startsWith('tz1')) {
            cleanedDestination = this.checkAndRemovePrefixToHex(originationOperation.delegate, this.tezosPrefixes.tz1)
          } else if (originationOperation.delegate.toLowerCase().startsWith('kt1')) {
            cleanedDestination = this.checkAndRemovePrefixToHex(originationOperation.delegate, this.tezosPrefixes.kt)
          }

          if (!cleanedDestination || cleanedDestination.length > 42) {
            // must be less or equal 21 bytes
            throw new Error('provided destination is invalid')
          }

          while (cleanedDestination.length !== 42) {
            // fill up with 0s to match 21 bytes
            cleanedDestination = '0' + cleanedDestination
          }

          resultHexString += cleanedDestination
        } else {
          // ABSENCE OF DELEGATE
          resultHexString += '00'
        }

        if (originationOperation.script) {
          // PRESENCE OF SCRIPT
          resultHexString += 'ff'

          throw new Error('script not supported')
        } else {
          // ABSENCE OF SCRIPT
          resultHexString += '00'
        }
      }

      if (operation.kind === TezosOperationType.DELEGATION) {
        const delegationOperation = operation as TezosDelegationOperation
        if (delegationOperation.delegate) {
          resultHexString += 'ff'

          let cleanedDestination

          if (delegationOperation.delegate.toLowerCase().startsWith('tz1')) {
            cleanedDestination = this.checkAndRemovePrefixToHex(delegationOperation.delegate, this.tezosPrefixes.tz1)
          } else if (delegationOperation.delegate.toLowerCase().startsWith('kt1')) {
            cleanedDestination = this.checkAndRemovePrefixToHex(delegationOperation.delegate, this.tezosPrefixes.kt)
          }

          if (!cleanedDestination || cleanedDestination.length > 42) {
            // must be less or equal 21 bytes
            throw new Error('provided destination is invalid')
          }

          while (cleanedDestination.length !== 42) {
            // fill up with 0s to match 21 bytes
            cleanedDestination = '0' + cleanedDestination
          }

          resultHexString += cleanedDestination
        } else {
          resultHexString += '00'
        }
      }

      return resultHexString
    })

    return branchHexString + forgedOperation.join('')
  }

  public bigNumberToZarith(inputNumber: BigNumber) {
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

  public findZarithEndIndex(hexString: string) {
    for (let i = 0; i < hexString.length; i += 2) {
      const byteSection = hexString.substr(i, 2)
      if (parseInt(byteSection, 16).toString(2).length !== 8) {
        return i + 2
      }
    }
    throw new Error('provided hex string is not Zarith encoded')
  }

  public zarithToBigNumber(hexString: string) {
    let bitString = ''
    for (let i = 0; i < hexString.length; i += 2) {
      const byteSection = hexString.substr(i, 2)
      const bitSection = ('00000000' + parseInt(byteSection, 16).toString(2)).substr(-7)
      bitString = bitSection + bitString
    }
    return new BigNumber(bitString, 2)
  }

  public async createRevealOperation(counter: BigNumber, publicKey: string, address: string): Promise<TezosRevealOperation> {
    const operation: TezosRevealOperation = {
      kind: TezosOperationType.REVEAL,
      fee: this.revealFee.toFixed(),
      gas_limit: '10000', // taken from conseiljs
      storage_limit: '0', // taken from conseiljs
      counter: counter.toFixed(),
      public_key: bs58check.encode(Buffer.concat([this.tezosPrefixes.edpk, Buffer.from(publicKey, 'hex')])),
      source: address
    }
    return operation
  }

  async signMessage(message: string, privateKey: Buffer): Promise<string> {
    return Promise.reject('Message signing not implemented')
  }

  async verifyMessage(message: string, signature: string, publicKey: Buffer): Promise<boolean> {
    return Promise.reject('Message verification not implemented')
  }

  /*
  async signMessage(message: string, privateKey: Buffer): Promise<string> {
    await sodium.ready
    const signature = sodium.crypto_sign_detached(sodium.from_string(message), privateKey)
    const hexSignature = Buffer.from(signature).toString('hex')

    return hexSignature
  }

  async verifyMessage(message: string, hexSignature: string, publicKey: Buffer): Promise<boolean> {
    await sodium.ready
    const signature = new Uint8Array(Buffer.from(hexSignature, 'hex'))
    const isValidSignature = sodium.crypto_sign_verify_detached(signature, message, publicKey)

    return isValidSignature
  }
  */
}
