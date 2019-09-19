import { generateWalletUsingDerivationPath } from '@aeternity/hd-wallet'
import axios, { AxiosError, AxiosResponse } from 'axios'
import BigNumber from 'bignumber.js'
import * as bs58check from 'bs58check'
import * as sodium from 'libsodium-wrappers'
import * as nacl from 'tweetnacl'

import { IAirGapSignedTransaction } from '../../interfaces/IAirGapSignedTransaction'
import { IAirGapTransaction } from '../../interfaces/IAirGapTransaction'
import { SignedTezosTransaction } from '../../serializer/signed-transactions/tezos-transactions.serializer'
import { RawTezosTransaction, UnsignedTezosTransaction } from '../../serializer/unsigned-transactions/tezos-transactions.serializer'
import { getSubProtocolsByIdentifier } from '../../utils/subProtocols'
import { CurrencyUnit, FeeDefaults, ICoinProtocol } from '../ICoinProtocol'
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

export interface TezosOperation {
  storage_limit: string
  gas_limit: string
  counter: string
  fee: string
  source: string
  kind: TezosOperationType
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
  fee: string
  gas_limit: string
  source: string
  storage_limit: string
  delegate?: string
  script?: string
}

export interface TezosRevealOperation extends TezosOperation {
  public_key: string
  kind: TezosOperationType.REVEAL
}

export class TezosProtocol extends NonExtendedProtocol implements ICoinProtocol {
  public symbol: string = 'XTZ'
  public name: string = 'Tezos'
  public marketSymbol: string = 'xtz'
  public feeSymbol: string = 'xtz'

  public decimals: number = 6
  public feeDecimals: number = 6 // micro tez is the smallest, 1000000 microtez is 1 tez
  public identifier: string = 'xtz'

  get subProtocols() {
    return getSubProtocolsByIdentifier(this.identifier)
  }

  // tezbox default
  public feeDefaults: FeeDefaults = {
    low: new BigNumber('0.001420'),
    medium: new BigNumber('0.001520'),
    high: new BigNumber('0.003000')
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'XTZ',
      factor: new BigNumber(1)
    }
  ]

  public supportsHD: boolean = false
  public standardDerivationPath: string = `m/44h/1729h/0h/0h`

  public addressIsCaseSensitive: boolean = true
  public addressValidationPattern: string = '^(tz1|KT1)[1-9A-Za-z]{33}$'
  public addressPlaceholder: string = 'tz1...'

  public blockExplorer: string = 'https://tzscan.io'

  protected readonly transactionFee: BigNumber = new BigNumber('1400')
  protected readonly originationSize: BigNumber = new BigNumber('257')
  protected readonly storageCostPerByte: BigNumber = new BigNumber('1000')

  protected readonly revealFee: BigNumber = new BigNumber('1300')
  protected readonly activationBurn: BigNumber = this.originationSize.times(this.storageCostPerByte)
  protected readonly originationBurn: BigNumber = this.originationSize.times(this.storageCostPerByte) // https://tezos.stackexchange.com/a/787

  // Tezos - We need to wrap these in Buffer due to non-compatible browser polyfills
  private readonly tezosPrefixes: {
    tz1: Buffer
    tz2: Buffer
    tz3: Buffer
    kt: Buffer
    edpk: Buffer
    edsk: Buffer
    edsig: Buffer
    branch: Buffer
  } = {
    tz1: Buffer.from(new Uint8Array([6, 161, 159])),
    tz2: Buffer.from(new Uint8Array([6, 161, 161])),
    tz3: Buffer.from(new Uint8Array([6, 161, 164])),
    kt: Buffer.from(new Uint8Array([2, 90, 121])),
    edpk: Buffer.from(new Uint8Array([13, 15, 37, 217])),
    edsk: Buffer.from(new Uint8Array([43, 246, 78, 7])),
    edsig: Buffer.from(new Uint8Array([9, 245, 205, 134, 18])),
    branch: Buffer.from(new Uint8Array([1, 52]))
  }

  /**
   * Tezos Implemention of ICoinProtocol
   */
  constructor(
    public readonly jsonRPCAPI: string = 'https://rpczero.tzbeta.net',
    public readonly baseApiUrl: string = 'https://api6.tzscan.io'
  ) {
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
    const { publicKey }: { publicKey: string } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)

    return Buffer.from(publicKey).toString('hex')
  }

  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  public getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Buffer {
    // both AE and Tezos use the same ECC curves (ed25519)
    const { secretKey }: { secretKey: string } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath)

    return Buffer.from(secretKey)
  }

  public async getAddressFromPublicKey(publicKey: string): Promise<string> {
    await sodium.ready

    const payload: Uint8Array = sodium.crypto_generichash(20, Buffer.from(publicKey, 'hex'))
    const address: string = bs58check.encode(Buffer.concat([this.tezosPrefixes.tz1, Buffer.from(payload)]))

    return address
  }

  public async getAddressesFromPublicKey(publicKey: string): Promise<string[]> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return [address]
  }

  public async getTransactionsFromPublicKey(publicKey: string, limit: number, offset: number): Promise<IAirGapTransaction[]> {
    const addresses: string[] = await this.getAddressesFromPublicKey(publicKey)

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
    await sodium.ready

    const watermark: string = '03'
    const watermarkedForgedOperationBytesHex: string = watermark + transaction.binaryTransaction
    const watermarkedForgedOperationBytes: Buffer = Buffer.from(watermarkedForgedOperationBytesHex, 'hex')
    const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes)

    const opSignature: Uint8Array = nacl.sign.detached(hashedWatermarkedOpBytes, privateKey)
    const signedOpBytes: Buffer = Buffer.concat([Buffer.from(transaction.binaryTransaction, 'hex'), Buffer.from(opSignature)])

    return signedOpBytes.toString('hex')
  }

  public async getTransactionDetails(unsignedTx: UnsignedTezosTransaction): Promise<IAirGapTransaction> {
    const binaryTransaction: string = unsignedTx.transaction.binaryTransaction
    const wrappedOperations: TezosWrappedOperation = this.unforgeUnsignedTezosWrappedOperation(binaryTransaction)

    return this.getAirGapTxFromWrappedOperations(wrappedOperations)
  }

  public async getTransactionDetailsFromSigned(signedTx: SignedTezosTransaction): Promise<IAirGapTransaction> {
    const binaryTransaction: string = signedTx.transaction
    const wrappedOperations: TezosWrappedOperation = this.unforgeSignedTezosWrappedOperation(binaryTransaction)

    return this.getAirGapTxFromWrappedOperations(wrappedOperations)
  }

  private getAirGapTxFromWrappedOperations(wrappedOperations: TezosWrappedOperation): IAirGapTransaction {
    const tezosOperation: TezosOperation = wrappedOperations.contents[wrappedOperations.contents.length - 1]

    let amount: BigNumber = new BigNumber(0)
    let to: string[] = ['']

    switch (tezosOperation.kind) {
      case TezosOperationType.TRANSACTION:
        amount = new BigNumber((tezosOperation as TezosSpendOperation).amount)
        to = [(tezosOperation as TezosSpendOperation).destination]

        break
      case TezosOperationType.ORIGINATION:
        {
          const tezosOriginationOperation: TezosOriginationOperation = tezosOperation as TezosOriginationOperation
          amount = new BigNumber(tezosOriginationOperation.balance)
          const delegate: string | undefined = tezosOriginationOperation.delegate
          to = [delegate ? `Delegate: ${delegate}` : 'Origination']
        }
        break
      case TezosOperationType.DELEGATION:
        {
          const delegate: string | undefined = (tezosOperation as TezosDelegationOperation).delegate
          to = [delegate ? delegate : 'Undelegate']
        }
        break
      default:
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
    let balance: BigNumber = new BigNumber(0)

    for (const address of addresses) {
      try {
        const { data }: AxiosResponse = await axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/balance`)
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
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address])
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: BigNumber[],
    fee: BigNumber,
    data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
    let counter: BigNumber = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []

    // check if we got an address-index
    const addressIndex: number = data && data.addressIndex ? data.addressIndex : 0
    const addresses: string[] = await this.getAddressesFromPublicKey(publicKey)

    if (!addresses[addressIndex]) {
      throw new Error('no kt-address with this index exists')
    }

    const address: string = addresses[addressIndex]

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager: string = results[2].data

      // check if we have revealed the address already
      if (!accountManager) {
        operations.push(await this.createRevealOperation(counter, publicKey, address))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const balance: BigNumber = await this.getBalanceOfPublicKey(publicKey)
    const receivingBalance: BigNumber = await this.getBalanceOfAddresses(recipients)

    const amountUsedByPreviousOperations: BigNumber = this.getAmountUsedByPreviousOperations(operations)

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

      const binaryTx: string = this.forgeTezosOperation(tezosWrappedOperation)

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
    let counter: BigNumber = new BigNumber(1)
    let branch: string

    const operations: TezosOperation[] = []
    const address: string = await this.getAddressFromPublicKey(publicKey)

    try {
      const results = await Promise.all([
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/counter`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/hash`),
        axios.get(`${this.jsonRPCAPI}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
      ])

      counter = new BigNumber(results[0].data).plus(1)
      branch = results[1].data

      const accountManager: { key: string } = results[2].data

      // check if we have revealed the key already
      if (!accountManager.key) {
        operations.push(await this.createRevealOperation(counter, publicKey, address))
        counter = counter.plus(1)
      }
    } catch (error) {
      throw error
    }

    const balance: BigNumber = await this.getBalanceOfAddresses([address])

    const amountUsedByPreviousOperations: BigNumber = this.getAmountUsedByPreviousOperations(operations)

    const combinedAmountsAndFees: BigNumber = this.transactionFee
      .plus(amountUsedByPreviousOperations)
      .plus(this.originationBurn)
      .plus(1)

    let balanceToSend: BigNumber = new BigNumber(0)

    if (delegate) {
      balanceToSend = balance // If delegate is set, by default we send the whole balance
    }

    if (amount && amount.isLessThan(balance)) {
      balanceToSend = amount // If amount is set and valid, we override
    }

    const maxAmount: BigNumber = balance.minus(combinedAmountsAndFees)

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
      balance: balanceToSend.toFixed(),
      delegate
    }

    operations.push(originationOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch,
        contents: operations
      }

      const binaryTx: string = this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error) {
      console.warn(error.message)
      throw new Error('Forging Tezos TX failed.')
    }
  }

  private getAmountUsedByPreviousOperations(operations: TezosOperation[]): BigNumber {
    let amountUsed: BigNumber = new BigNumber(0)
    const assertNever: (x: never) => void = (x: never): void => undefined

    operations.forEach((operation: TezosOperation) => {
      amountUsed = amountUsed.plus(operation.fee) // Fee has to be added for every operation type

      switch (operation.kind) {
        case TezosOperationType.REVEAL:
          // const revealOperation = operation as TezosRevealOperation
          // No additional amount/fee
          break
        case TezosOperationType.ORIGINATION:
          const originationOperation: TezosOriginationOperation = operation as TezosOriginationOperation
          amountUsed = amountUsed.plus(originationOperation.balance)
          break
        case TezosOperationType.DELEGATION:
          // const delegationOperation = operation as TezosDelegationOperation
          // No additional amount/fee
          break
        case TezosOperationType.TRANSACTION:
          const spendOperation: TezosSpendOperation = operation as TezosSpendOperation
          amountUsed = amountUsed.plus(spendOperation.amount)
          break
        default:
          assertNever(operation.kind) // Exhaustive if
      }
    })

    return amountUsed
  }

  public async broadcastTransaction(rawTransaction: IAirGapSignedTransaction): Promise<string> {
    const payload: IAirGapSignedTransaction = rawTransaction

    try {
      const { data: injectionResponse }: { data: string } = await axios.post(
        `${this.jsonRPCAPI}/injection/operation?chain=main`,
        JSON.stringify(payload),
        {
          headers: { 'content-type': 'application/json' }
        }
      )

      // returns hash if successful
      return injectionResponse
    } catch (err) {
      console.warn((err as AxiosError).message, ((err as AxiosError).response as AxiosResponse).statusText)
      throw new Error('broadcasting failed')
    }
  }

  protected checkAndRemovePrefixToHex(base58CheckEncodedPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex: string = Buffer.from(tezosPrefix).toString('hex')
    const payload: string = bs58check.decode(base58CheckEncodedPayload).toString('hex')
    if (payload.startsWith(prefixHex)) {
      return payload.substring(tezosPrefix.length * 2)
    } else {
      throw new Error(`payload did not match prefix: ${prefixHex}`)
    }
  }

  protected prefixAndBase58CheckEncode(hexStringPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex: string = Buffer.from(tezosPrefix).toString('hex')

    return bs58check.encode(Buffer.from(prefixHex + hexStringPayload, 'hex'))
  }

  protected splitAndReturnRest(payload: string, length: number): { result: string; rest: string } {
    const result: string = payload.substr(0, length)
    const rest: string = payload.substr(length, payload.length - length)

    return { result, rest }
  }

  protected parseAddress(rawHexAddress: string): string {
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexAddress, 2)
    const contractIdTag: string = result
    if (contractIdTag === '00') {
      // tz address
      return this.parseTzAddress(rest)
    } else if (contractIdTag === '01') {
      // kt address
      return this.prefixAndBase58CheckEncode(rest.slice(0, -2), this.tezosPrefixes.kt)
    } else {
      throw new Error('address format not supported')
    }
  }

  protected parseTzAddress(rawHexAddress: string): string {
    // tz1 address
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexAddress, 2)
    const publicKeyHashTag: string = result
    if (publicKeyHashTag === '00') {
      return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.tz1)
    } else {
      throw new Error('address format not supported')
    }
  }

  protected parsePublicKey(rawHexPublicKey: string): string {
    const { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(rawHexPublicKey, 2)
    const tag: string = result
    if (tag === '00') {
      // tz1 address
      return this.prefixAndBase58CheckEncode(rest, this.tezosPrefixes.edpk)
    } else {
      throw new Error('public key format not supported')
    }
  }

  private checkBoolean(hexString: string): boolean {
    if (hexString === 'ff') {
      return true
    } else if (hexString === '00') {
      return false
    } else {
      throw new Error('Boolean value invalid!')
    }
  }

  public unforgeSignedTezosWrappedOperation(hexString: string): TezosWrappedOperation {
    if (hexString.length <= 128) {
      throw new Error('Not a valid signed transaction')
    }

    return this.unforgeUnsignedTezosWrappedOperation(hexString.substring(0, hexString.length - 128))
  }

  public unforgeUnsignedTezosWrappedOperation(hexString: string): TezosWrappedOperation {
    let { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(hexString, 64)
    const branch: string = this.prefixAndBase58CheckEncode(result, this.tezosPrefixes.branch)

    const tezosWrappedOperation: TezosWrappedOperation = {
      branch,
      contents: []
    }

    while (rest.length > 0) {
      ;({ result, rest } = this.splitAndReturnRest(rest, 2))
      const kindHexString: string = result

      switch (kindHexString) {
        case '07':
        case '08':
        case '09':
        case '0a':
          throw new Error(`deprecated operations found with tag ${kindHexString}`)
        case '6b':
          let tezosRevealOperation: TezosRevealOperation
          ;({ tezosRevealOperation, rest } = this.unforgeRevealOperation(rest))
          tezosWrappedOperation.contents.push(tezosRevealOperation)
          break
        case '6c':
          let tezosSpendOperation: TezosSpendOperation
          ;({ tezosSpendOperation, rest } = this.unforgeSpendOperation(rest))
          tezosWrappedOperation.contents.push(tezosSpendOperation)
          break
        case '6d':
          let tezosOriginationOperation: TezosOriginationOperation
          ;({ tezosOriginationOperation, rest } = this.unforgeOriginationOperation(rest))
          tezosWrappedOperation.contents.push(tezosOriginationOperation)
          break
        case '6e':
          let tezosDelegationOperation: TezosDelegationOperation
          ;({ tezosDelegationOperation, rest } = this.unforgeDelegationOperation(rest))
          tezosWrappedOperation.contents.push(tezosDelegationOperation)
          break
        default:
          throw new Error('transaction operation unknown')
      }
    }

    return tezosWrappedOperation
  }

  public unforgeRevealOperation(hexString: string): { tezosRevealOperation: TezosRevealOperation; rest: string } {
    let { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(hexString, 42)
    const source: string = this.parseTzAddress(result)

    // fee, counter, gas_limit, storage_limit
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const fee: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const counter: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const gasLimit: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const storageLimit: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, 66))
    const publicKey: string = this.parsePublicKey(result)

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
    let { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(hexString, 42)
    const source: string = this.parseTzAddress(result)

    // fee, counter, gas_limit, storage_limit, amount
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const fee: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const counter: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const gasLimit: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const storageLimit: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const amount: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, 44))
    const destination: string = this.parseAddress(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, 2))
    const hasParameters: boolean = this.checkBoolean(result)

    if (hasParameters) {
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
    let { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(hexString, 42)
    const source: string = this.parseTzAddress(result)

    // fee, counter, gas_limit, storage_limit
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const fee: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const counter: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const gasLimit: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const storageLimit: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const balance: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, 2))
    const hasDelegate: boolean = this.checkBoolean(result)
    let delegate: string | undefined
    if (hasDelegate) {
      // Delegate is optional
      ;({ result, rest } = this.splitAndReturnRest(rest, 42))
      delegate = this.parseAddress(`00${result}`)
    }

    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const script: BigNumber = this.zarithToBigNumber(result) // TODO: What is the type here?

    return {
      tezosOriginationOperation: {
        source,
        kind: TezosOperationType.ORIGINATION,
        fee: fee.toFixed(),
        gas_limit: gasLimit.toFixed(),
        storage_limit: storageLimit.toFixed(),
        counter: counter.toFixed(),
        balance: balance.toFixed(),
        delegate,
        script: script ? script.toString() : undefined
      },
      rest
    }
  }

  public unforgeDelegationOperation(hexString: string): { tezosDelegationOperation: TezosDelegationOperation; rest: string } {
    let { result, rest }: { result: string; rest: string } = this.splitAndReturnRest(hexString, 42)
    const source: string = this.parseTzAddress(result)

    // fee, counter, gas_limit, storage_limit, amount
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const fee: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const counter: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const gasLimit: BigNumber = this.zarithToBigNumber(result)
    ;({ result, rest } = this.splitAndReturnRest(rest, this.findZarithEndIndex(rest)))
    const storageLimit: BigNumber = this.zarithToBigNumber(result)

    let delegate: string | undefined
    if (rest.length === 42) {
      ;({ result, rest } = this.splitAndReturnRest(`01${rest.slice(2)}`, 42))
      delegate = this.parseAddress(result)
    } else if (rest.length > 42) {
      ;({ result, rest } = this.splitAndReturnRest(`00${rest.slice(2)}`, 44))
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

  public forgeTezosOperation(tezosWrappedOperation: TezosWrappedOperation): string {
    // taken from http://tezos.gitlab.io/mainnet/api/p2p.html
    const cleanedBranch: string = this.checkAndRemovePrefixToHex(tezosWrappedOperation.branch, this.tezosPrefixes.branch) // ignore the tezos prefix
    if (cleanedBranch.length !== 64) {
      // must be 32 bytes
      throw new Error('provided branch is invalid')
    }

    const branchHexString: string = cleanedBranch // ignore the tezos prefix

    const forgedOperation: string[] = tezosWrappedOperation.contents.map((operation: TezosOperation) => {
      switch (operation.kind) {
        case TezosOperationType.TRANSACTION:
          return this.forgeTransactionOperation(operation)

        case TezosOperationType.REVEAL:
          return this.forgeRevealOperation(operation)

        case TezosOperationType.ORIGINATION:
          return this.forgeOriginationOperation(operation)

        case TezosOperationType.DELEGATION:
          return this.forgeDelegationOperation(operation)

        default:
          throw new Error(`Currently unsupported operation type supplied ${operation.kind}`)
      }
    })

    return branchHexString + forgedOperation.join('')
  }

  private forgeSharedFields(operation: TezosOperation): string {
    let resultHexString: string = ''

    let cleanedSource: string = this.checkAndRemovePrefixToHex(operation.source, this.tezosPrefixes.tz1)

    if (cleanedSource.length > 42) {
      // must be less or equal 21 bytes
      throw new Error('provided source is invalid')
    }

    while (cleanedSource.length !== 42) {
      // fill up with 0s to match 21 bytes
      cleanedSource = `0${cleanedSource}`
    }

    resultHexString += cleanedSource
    resultHexString += this.bigNumberToZarith(new BigNumber(operation.fee))
    resultHexString += this.bigNumberToZarith(new BigNumber(operation.counter))
    resultHexString += this.bigNumberToZarith(new BigNumber(operation.gas_limit))
    resultHexString += this.bigNumberToZarith(new BigNumber(operation.storage_limit))

    return resultHexString
  }

  private forgeRevealOperation(operation: TezosOperation): string {
    let resultHexString: string = ''
    resultHexString += '6b' // because this is a reveal operation
    resultHexString += this.forgeSharedFields(operation)

    const cleanedPublicKey: string = this.checkAndRemovePrefixToHex((operation as TezosRevealOperation).public_key, this.tezosPrefixes.edpk)

    if (cleanedPublicKey.length === 32) {
      // must be equal 32 bytes
      throw new Error('provided public key is invalid')
    }

    resultHexString += `00${cleanedPublicKey}`

    return resultHexString
  }

  private forgeTransactionOperation(operation: TezosOperation): string {
    let resultHexString: string = ''
    resultHexString += '6c' // because this is a transaction operation
    resultHexString += this.forgeSharedFields(operation)

    resultHexString += this.bigNumberToZarith(new BigNumber((operation as TezosSpendOperation).amount))

    let cleanedDestination: string = (operation as TezosSpendOperation).destination.toLowerCase().startsWith('kt')
      ? `01${this.checkAndRemovePrefixToHex((operation as TezosSpendOperation).destination, this.tezosPrefixes.kt)}00`
      : this.checkAndRemovePrefixToHex((operation as TezosSpendOperation).destination, this.tezosPrefixes.tz1)

    if (cleanedDestination.length > 44) {
      // must be less or equal 22 bytes
      throw new Error('provided destination is invalid')
    }

    while (cleanedDestination.length !== 44) {
      // fill up with 0s to match 22bytes
      cleanedDestination = `0${cleanedDestination}`
    }

    resultHexString += cleanedDestination

    resultHexString += '00' // because we have no additional parameters

    return resultHexString
  }

  private forgeOriginationOperation(operation: TezosOperation): string {
    let resultHexString: string = ''
    resultHexString += '6d' // because this is a reveal operation
    resultHexString += this.forgeSharedFields(operation)

    const originationOperation: TezosOriginationOperation = operation as TezosOriginationOperation

    resultHexString += this.bigNumberToZarith(new BigNumber(originationOperation.balance))

    if (originationOperation.delegate) {
      // PRESENCE OF DELEGATE
      resultHexString += 'ff'

      let cleanedDestination: string | undefined

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
        cleanedDestination = `0${cleanedDestination}`
      }

      resultHexString += cleanedDestination
    } else {
      // ABSENCE OF DELEGATE
      resultHexString += '00'
    }

    if (originationOperation.script) {
      throw new Error('script not supported')
    }

    return resultHexString
  }

  private forgeDelegationOperation(operation: TezosOperation): string {
    let resultHexString: string = ''
    resultHexString += '6e' // because this is a reveal operation
    resultHexString += this.forgeSharedFields(operation)

    const delegationOperation: TezosDelegationOperation = operation as TezosDelegationOperation
    if (delegationOperation.delegate) {
      resultHexString += 'ff'

      let cleanedDestination: string | undefined

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
        cleanedDestination = `0${cleanedDestination}`
      }

      resultHexString += cleanedDestination
    } else {
      resultHexString += '00'
    }

    return resultHexString
  }

  public bigNumberToZarith(inputNumber: BigNumber): string {
    let bitString: string = inputNumber.toString(2)
    while (bitString.length % 7 !== 0) {
      bitString = `0${bitString}` // fill up with leading '0'
    }

    let resultHexString: string = ''
    // because it's little endian we start from behind...
    for (let i: number = bitString.length; i > 0; i -= 7) {
      let bitStringSection: string = bitString.substring(i - 7, i)

      // tslint:disable-next-line:prefer-conditional-expression
      if (i === 7) {
        // the last byte will show it's the last with a leading '0'
        bitStringSection = `0${bitStringSection}`
      } else {
        // the others will show more will come with a leading '1'
        bitStringSection = `1${bitStringSection}`
      }
      let hexStringSection: string = parseInt(bitStringSection, 2).toString(16)

      if (hexStringSection.length % 2) {
        hexStringSection = `0${hexStringSection}`
      }

      resultHexString += hexStringSection
    }

    return resultHexString
  }

  public findZarithEndIndex(hexString: string): number {
    for (let i: number = 0; i < hexString.length; i += 2) {
      const byteSection: string = hexString.substr(i, 2)
      if (parseInt(byteSection, 16).toString(2).length !== 8) {
        return i + 2
      }
    }
    throw new Error('provided hex string is not Zarith encoded')
  }

  public zarithToBigNumber(hexString: string): BigNumber {
    let bitString: string = ''
    for (let i: number = 0; i < hexString.length; i += 2) {
      const byteSection: string = hexString.substr(i, 2)
      const bitSection: string = `00000000${parseInt(byteSection, 16).toString(2)}`.substr(-7)
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
}
