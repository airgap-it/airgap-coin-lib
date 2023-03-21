import { assertNever, CoinlibError, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios, { AxiosError, AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
// @ts-ignore
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
import {
  BalanceError,
  ConditionViolationError,
  NetworkError,
  PropertyUndefinedError,
  ProtocolErrorType,
  TransactionError,
  UnsupportedError
} from '@airgap/coinlib-core/errors'
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newPublicKey,
  newSecretKey,
  newSignature,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolAccountMetadata,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  Signature,
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'

import { TezosCryptoClient } from '../crypto/TezosCryptoClient'
import { TezosAddress } from '../data/TezosAddress'
import { createTezosIndexerClient } from '../indexer/factory'
import { TezosIndexerClient } from '../indexer/TezosIndexerClient'
import { TezosCryptoConfiguration } from '../types/crypto'
import { TezosNetwork } from '../types/network'
import { RunOperationInternalOperationResult, RunOperationMetadata, RunOperationOperationResult, RunOperationResponse } from '../types/node'
import { TezosDelegationOperation } from '../types/operations/kinds/Delegation'
import { TezosOriginationOperation } from '../types/operations/kinds/Origination'
import { TezosRevealOperation } from '../types/operations/kinds/Reveal'
import { TezosOperation } from '../types/operations/kinds/TezosOperation'
import { TezosTransactionOperation } from '../types/operations/kinds/Transaction'
import { TezosOperationType } from '../types/operations/TezosOperationType'
import { TezosWrappedOperation } from '../types/operations/TezosWrappedOperation'
import { TezosProtocolNetwork, TezosProtocolOptions, TezosUnits } from '../types/protocol'
import { TezosSignedTransaction, TezosTransactionCursor, TezosUnsignedTransaction } from '../types/transaction'
import { convertPublicKey, convertSecretKey } from '../utils/key'
import { ACTIVATION_BURN, createRevealOperation, getAmountUsedByPreviousOperations, REVEAL_FEE } from '../utils/operations'
import { TezosAccountant } from '../utils/protocol/tezos/TezosAccountant'
import { TezosForger } from '../utils/protocol/tezos/TezosForger'
import { convertSignature } from '../utils/signature'

// Interface

export interface TezosProtocol
  extends AirGapProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: TezosProtocolNetwork
      CryptoConfiguration: TezosCryptoConfiguration
      Units: TezosUnits
      FeeEstimation: FeeDefaults<TezosUnits>
      UnsignedTransaction: TezosUnsignedTransaction
      SignedTransaction: TezosSignedTransaction
      TransactionCursor: TezosTransactionCursor
    },
    'Crypto',
    'FetchDataForAddress'
  > {
  forgeOperation(wrappedOperation: TezosWrappedOperation): Promise<string>
  unforgeOperation(forged: string, type?: (TezosSignedTransaction | TezosUnsignedTransaction)['type']): Promise<TezosWrappedOperation>
  getOperationFeeDefaults(publicKey: PublicKey, operations: TezosOperation[]): Promise<FeeDefaults<TezosUnits>>
  prepareOperations(publicKey: PublicKey, operationRequests: TezosOperation[], overrideParameters?: boolean): Promise<TezosWrappedOperation>
  prepareTransactionsWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<TezosUnits>[],
    configuration?: TransactionConfiguration<TezosUnits> & { operationsPerGroup?: number }
  ): Promise<TezosUnsignedTransaction[]>
}

// Implementation

const MAX_OPERATIONS_PER_GROUP: number = 200
const MAX_GAS_PER_BLOCK: number = 5200000

const GAS_LIMIT_PLACEHOLDER: string = '1040000'
const STORAGE_LIMIT_PLACEHOLDER: string = '60000'
const FEE_PLACEHOLDER: string = '0'

const MINIMAL_FEE: number = 100
const MINIMAL_FEE_PER_GAS_UNIT: number = 0.1
const MINIMAL_FEE_PER_BYTE: number = 1

export const TEZOS_UNITS: ProtocolUnitsMetadata<TezosUnits> = {
  tez: {
    symbol: { value: 'XTZ', market: 'xtz' },
    decimals: 6
  },
  mutez: {
    symbol: { value: 'mutez' },
    decimals: 0
  },
  nanotez: {
    symbol: { value: 'nanotez' },
    decimals: -3
  }
}

export const TEZOS_DERIVATION_PATH: string = `m/44h/1729h/0h/0h`
export const TEZOS_ACCOUNT_METADATA: ProtocolAccountMetadata = {
  standardDerivationPath: TEZOS_DERIVATION_PATH,
  address: {
    isCaseSensitive: true,
    placeholder: 'tz1...',
    regex: '^((tz1|tz2|tz3|tz4|KT1)[1-9A-Za-z]{33}|zet1[1-9A-Za-z]{65})$'
  }
}

export class TezosProtocolImpl implements TezosProtocol {
  private readonly options: TezosProtocolOptions

  private readonly forger: TezosForger
  private readonly accountant: TezosAccountant<TezosUnits>

  private readonly indexerClient: TezosIndexerClient
  private readonly cryptoClient: TezosCryptoClient

  public constructor(options: RecursivePartial<TezosProtocolOptions>) {
    this.options = createTezosProtocolOptions(options.network)

    this.forger = new TezosForger()
    this.accountant = new TezosAccountant(this.forger, this.options.network)

    this.indexerClient = createTezosIndexerClient(this.options.network.indexer)
    this.cryptoClient = new TezosCryptoClient()
  }

  // Common

  private readonly units: ProtocolUnitsMetadata<TezosUnits> = TEZOS_UNITS

  private readonly feeDefaults: FeeDefaults<TezosUnits> = {
    low: newAmount(0.00142, 'tez').blockchain(this.units),
    medium: newAmount(0.00152, 'tez').blockchain(this.units),
    high: newAmount(0.003, 'tez').blockchain(this.units)
  }

  private readonly metadata: ProtocolMetadata<TezosUnits> = {
    identifier: MainProtocolSymbols.XTZ,
    name: 'Tezos',

    units: this.units,
    mainUnit: 'tez',

    fee: {
      defaults: this.feeDefaults
    },

    account: TEZOS_ACCOUNT_METADATA
  }

  public async getMetadata(): Promise<ProtocolMetadata<TezosUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return TezosAddress.fromPublicKey(publicKey).asString()
  }

  public async getDetailsFromTransaction(
    transaction: TezosUnsignedTransaction | TezosSignedTransaction,
    _publicKey: PublicKey
  ): Promise<AirGapTransaction<TezosUnits>[]> {
    return this.accountant.getDetailsFromTransaction(transaction)
  }

  public async verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean> {
    const encodedSignature: Signature = convertSignature(signature, 'encoded')
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.verifyMessage(message, encodedSignature.value, hexPublicKey.value)
  }

  public async encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string> {
    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex')

    return this.cryptoClient.encryptAsymmetric(payload, hexPublicKey.value)
  }

  // Offline

  private readonly cryptoConfiguration: TezosCryptoConfiguration = {
    algorithm: 'ed25519'
  }

  public async getCryptoConfiguration(): Promise<TezosCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    // should we maybe return encoded keys, i.e. edsk... and edpk... strings?
    return {
      secretKey: newSecretKey(
        Buffer.concat([Buffer.from(derivative.secretKey, 'hex'), Buffer.from(derivative.publicKey, 'hex')]).toString('hex'),
        'hex'
      ),
      publicKey: newPublicKey(derivative.publicKey, 'hex')
    }
  }

  public async signTransactionWithSecretKey(transaction: TezosUnsignedTransaction, secretKey: SecretKey): Promise<TezosSignedTransaction> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')
    const binaryTransaction: Buffer = Buffer.from(transaction.binary, 'hex')
    const opSignature: Buffer = this.cryptoClient.operationSignature(Buffer.from(hexSecretKey.value, 'hex'), binaryTransaction)
    const signedOp: Buffer = Buffer.concat([binaryTransaction, opSignature])

    return newSignedTransaction<TezosSignedTransaction>({ binary: signedOp.toString('hex') })
  }

  public async signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature> {
    const hexSecretKey: SecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    const signature: string = await this.cryptoClient.signMessage(message, { privateKey: hexSecretKey.value })

    return newSignature(signature, 'encoded')
  }

  public async decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(keyPair.secretKey, 'hex')
    const hexPublicKey: PublicKey = convertPublicKey(keyPair.publicKey, 'hex')

    return this.cryptoClient.decryptAsymmetric(payload, { publicKey: hexPublicKey.value, privateKey: hexSecretKey.value })
  }

  public async encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    return this.cryptoClient.encryptAES(payload, hexSecretKey.value)
  }

  public async decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex')

    return this.cryptoClient.decryptAES(payload, hexSecretKey.value)
  }

  // Online

  public async getNetwork(): Promise<TezosProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosTransactionCursor, TezosUnits, TezosUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosTransactionCursor, TezosUnits, TezosUnits>> {
    const transactions: Omit<AirGapTransaction<TezosUnits>, 'network'>[] = await this.indexerClient.getTransactions(
      address,
      limit,
      cursor?.offset
    )

    return {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        network: this.options.network
      })),
      cursor: {
        hasNext: transactions.length >= limit,
        offset: (cursor?.offset ?? 0) + transactions.length
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<TezosUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<TezosUnits>> {
    let balance: BigNumber = new BigNumber(0)

    try {
      const { data }: AxiosResponse = await axios.get(
        `${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/balance`
      )
      balance = new BigNumber(data)
    } catch (error: any) {
      // if node returns 404 (which means 'no account found'), go with 0 balance
      if (error.response && error.response.status !== 404) {
        throw new NetworkError(Domain.TEZOS, error as AxiosError)
      }
    }

    return { total: newAmount(balance, 'blockchain') }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionConfiguration<TezosUnits>
  ): Promise<Amount<TezosUnits>> {
    const { total } = await this.getBalanceOfPublicKey(publicKey)
    const adjustedTotal = new BigNumber(newAmount(total).convert('mutez', this.units).value).minus(1) // Tezos accounts can never be empty. We must leave at least 1 mutez behind.

    return this.getTansactionMaxAmountWithBalance(publicKey, adjustedTotal, to, configuration?.fee)
  }

  private async getTansactionMaxAmountWithBalance(
    publicKey: PublicKey,
    balance: BigNumber,
    to: string[],
    fee?: Amount<TezosUnits>
  ): Promise<Amount<TezosUnits>> {
    let maxFee: Amount<TezosUnits>
    if (fee !== undefined) {
      maxFee = fee
    } else {
      try {
        const estimatedFee: FeeDefaults<TezosUnits> = await this.getTransactionFeeWithPublicKey(
          publicKey,
          to.map((recipient: string) => ({
            to: recipient,
            amount: newAmount(balance.div(to.length).decimalPlaces(0, BigNumber.ROUND_CEIL), 'blockchain')
          }))
        )

        maxFee = newAmount(estimatedFee.medium).blockchain(this.units)
        if (balance.lte(maxFee.value)) {
          maxFee = newAmount(0, 'blockchain')
        }
      } catch (error: any) {
        if (error.code !== undefined && error.code === ProtocolErrorType.TRANSACTION_FAILED && Array.isArray(error.data)) {
          const rpcErrors = error.data as { id: string; kind: string; amount?: string; balance?: string; contract?: string }[]
          const balanceTooLowError = rpcErrors.find((error) => error.id.endsWith('.contract.balance_too_low'))
          if (balanceTooLowError !== undefined && balanceTooLowError.amount !== undefined && balanceTooLowError.balance !== undefined) {
            const excess = new BigNumber(balanceTooLowError.amount).minus(new BigNumber(balanceTooLowError.balance).minus(1))
            const newMaxBalance = balance.minus(excess)
            if (newMaxBalance.gt(0)) {
              return this.getTansactionMaxAmountWithBalance(publicKey, newMaxBalance, to, fee)
            }
          }
        }
        throw error as CoinlibError
      }
    }

    maxFee = newAmount(maxFee).blockchain(this.units)

    let amountWithoutFees: BigNumber = balance.minus(maxFee.value)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return newAmount(amountWithoutFees, 'blockchain')
  }

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<TezosUnits>[]
  ): Promise<FeeDefaults<TezosUnits>> {
    if (details.length === 0) {
      return this.feeDefaults
    }

    const operations: TezosOperation[] = []
    for (let i = 0; i < details.length; ++i) {
      const recipient = details[i].to
      const transaction: Partial<TezosTransactionOperation> = {
        kind: TezosOperationType.TRANSACTION,
        amount: newAmount(details[i].amount).blockchain(this.units).value,
        destination: recipient,
        fee: '0'
      }
      operations.push(transaction as TezosOperation)
    }

    return this.getOperationFeeDefaults(publicKey, operations)
  }

  public async getOperationFeeDefaults(publicKey: PublicKey, operations: TezosOperation[]): Promise<FeeDefaults<TezosUnits>> {
    const estimated = await this.prepareOperations(publicKey, operations)
    const hasReveal = estimated.contents.some((op) => op.kind === TezosOperationType.REVEAL)
    const estimatedFee = estimated.contents
      .reduce((current, next: any) => {
        if (next.fee !== undefined) {
          return current.plus(new BigNumber(next.fee))
        }

        return current
      }, new BigNumber(0))
      .minus(hasReveal ? REVEAL_FEE : 0)
      .div(hasReveal ? estimated.contents.length - 1 : estimated.contents.length)

    const feeStepFactor = new BigNumber(0.2)
    const lowFee = estimatedFee
    const mediumFee = lowFee.plus(lowFee.times(feeStepFactor).integerValue(BigNumber.ROUND_FLOOR))
    const highFee = mediumFee.plus(mediumFee.times(feeStepFactor).integerValue(BigNumber.ROUND_FLOOR))

    return {
      low: newAmount(lowFee, 'blockchain'),
      medium: newAmount(mediumFee, 'blockchain'),
      high: newAmount(highFee, 'blockchain')
    }
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<TezosUnits>[],
    configuration?: TransactionConfiguration<TezosUnits>
  ): Promise<TezosUnsignedTransaction> {
    if (details.length > MAX_OPERATIONS_PER_GROUP) {
      throw new ConditionViolationError(
        Domain.TEZOS,
        `this transaction exceeds the maximum allowed number of transactions per operation (${MAX_OPERATIONS_PER_GROUP}). Please use the "prepareTransactionsFromPublicKey" method instead.`
      )
    }

    const transactions: TezosUnsignedTransaction[] = await this.prepareTransactionsWithPublicKey(publicKey, details, configuration)
    if (transactions.length === 1) {
      return transactions[0]
    } else {
      throw new ConditionViolationError(
        Domain.TEZOS,
        'Transaction could not be prepared. More or less than 1 operations have been generated.'
      )
    }
  }

  public async broadcastTransaction(transaction: TezosSignedTransaction): Promise<string> {
    const { data: injectionResponse }: { data: string } = await axios
      .post(`${this.options.network.rpcUrl}/injection/operation?chain=main`, JSON.stringify(transaction.binary), {
        headers: { 'content-type': 'application/json' }
      })
      .catch((error) => {
        throw new NetworkError(Domain.TEZOS, error as AxiosError)
      })

    // returns hash if successful
    return injectionResponse
  }

  // Custom

  public async forgeOperation(wrappedOperation: TezosWrappedOperation): Promise<string> {
    return this.forger.forgeOperation(wrappedOperation)
  }

  public async unforgeOperation(
    forged: string,
    type: (TezosSignedTransaction | TezosUnsignedTransaction)['type'] = 'unsigned'
  ): Promise<TezosWrappedOperation> {
    return this.forger.unforgeOperation(forged, type)
  }

  public async prepareTransactionsWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<TezosUnits>[],
    configuration?: TransactionConfiguration<TezosUnits> & { operationsPerGroup?: number }
  ): Promise<TezosUnsignedTransaction[]> {
    const operationsPerGroup: number = configuration?.operationsPerGroup ?? MAX_OPERATIONS_PER_GROUP

    let fee: Amount<TezosUnits>
    if (configuration?.fee !== undefined) {
      fee = configuration.fee
    } else {
      const estimatedFee: FeeDefaults<TezosUnits> = await this.getTransactionFeeWithPublicKey(publicKey, details)
      fee = estimatedFee.medium
    }

    const wrappedFee: BigNumber = new BigNumber(newAmount(fee).blockchain(this.units).value)
    const address: string = await this.getAddressFromPublicKey(publicKey)

    const operations: TezosOperation[] = []

    const results = await Promise.all([
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/counter`),
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head~2/hash`),
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
    ]).catch((error) => {
      throw new NetworkError(Domain.TEZOS, error as AxiosError)
    })

    const currentCounter = new BigNumber(results[0].data)
    let counter = currentCounter.plus(1)
    const branch = results[1].data
    const accountManager: { key: string } = results[2].data

    // check if we have revealed the address already
    if (!accountManager) {
      operations.push(createRevealOperation(counter, publicKey, address))
      counter = counter.plus(1)
    }

    const { total, transferable }: Balance<TezosUnits> = await this.getBalanceOfPublicKey(publicKey)
    const balance: BigNumber = new BigNumber(newAmount(transferable ?? total).blockchain(this.units).value)

    const transactions: TezosUnsignedTransaction[] = []

    let allOperations = await this.createTransactionOperations(operations, details, wrappedFee, address, counter, balance)
    allOperations = operations.concat(allOperations) // if we have a reveal in operations, we need to make sure it is present in the allOperations array

    const numberOfGroups: number = Math.ceil(allOperations.length / operationsPerGroup)
    const startingCounter = numberOfGroups > 1 ? currentCounter.plus(1) : undefined
    for (let i = 0; i < numberOfGroups; i++) {
      const start = i * operationsPerGroup
      const end = start + operationsPerGroup

      const operationsGroup = allOperations.slice(start, end)

      const wrappedOperationWithEstimatedGas: TezosWrappedOperation = await this.estimateAndReplaceLimitsAndFee(
        {
          branch,
          contents: operationsGroup
        },
        false,
        startingCounter
      )

      const forged: string = await this.forgeOperation(wrappedOperationWithEstimatedGas)

      transactions.push(newUnsignedTransaction({ binary: forged }))
    }

    return transactions
  }

  public async prepareOperations(
    publicKey: PublicKey,
    operationRequests: TezosOperation[],
    overrideParameters: boolean = true
  ): Promise<TezosWrappedOperation> {
    let counter: BigNumber = new BigNumber(1)
    let branch: string
    const operations: TezosOperation[] = []

    const address: string = await this.getAddressFromPublicKey(publicKey)

    const results = await Promise.all([
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/counter`),
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head~2/hash`),
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/manager_key`)
    ]).catch((error) => {
      throw new NetworkError(Domain.TEZOS, error as AxiosError)
    })

    counter = new BigNumber(results[0].data).plus(1)
    branch = results[1].data

    const accountManager: { key: string } = results[2].data

    const hasRevealInOperationRequests = operationRequests.some((request: TezosOperation) => request.kind === TezosOperationType.REVEAL)

    // check if we have revealed the address already
    if (!accountManager && !hasRevealInOperationRequests) {
      operations.push(createRevealOperation(counter, publicKey, address))
      counter = counter.plus(1)
    }

    // tslint:disable:cyclomatic-complexity
    const operationPromises: Promise<TezosOperation>[] = operationRequests.map(async (operationRequest: TezosOperation, index: number) => {
      // TODO: Handle activation burn

      if (!operationRequest.kind) {
        throw new PropertyUndefinedError(Domain.TEZOS, 'property "kind" was not defined')
      }

      const recipient: string | undefined = (operationRequest as TezosTransactionOperation).destination
      let receivingBalance: BigNumber | undefined
      if (recipient && recipient.toLowerCase().startsWith('tz')) {
        const { total } = await this.getBalanceOfAddress(recipient)
        receivingBalance = new BigNumber(newAmount(total).blockchain(this.units).value)
      }

      const defaultCounter: string = counter.plus(index).toFixed() // TODO: Handle counter if we have some operations without counters in the array
      const defaultFee: string = FEE_PLACEHOLDER
      const defaultGasLimit: string = '10300'
      const defaultStorageLimit: string =
        receivingBalance && receivingBalance.isZero() && recipient && recipient.toLowerCase().startsWith('tz') ? '300' : '0' // taken from eztz

      switch (operationRequest.kind) {
        // TODO: Handle if the dApp already provides a reveal operation
        case TezosOperationType.REVEAL:
          const revealOperation: TezosRevealOperation = operationRequest as TezosRevealOperation

          if (!revealOperation.public_key) {
            throw new PropertyUndefinedError(Domain.TEZOS, 'property "public_key" was not defined')
          }

          revealOperation.source = revealOperation.source ?? address
          revealOperation.counter = revealOperation.counter ?? defaultCounter
          revealOperation.fee = revealOperation.fee ?? defaultFee
          revealOperation.gas_limit = revealOperation.gas_limit ?? defaultGasLimit
          revealOperation.storage_limit = revealOperation.storage_limit ?? defaultStorageLimit

          return revealOperation
        case TezosOperationType.DELEGATION:
          const delegationOperation: TezosDelegationOperation = operationRequest as TezosDelegationOperation

          // The delegate property is optional, so we don't have any mandatory properties to check for

          delegationOperation.source = delegationOperation.source ?? address
          delegationOperation.counter = delegationOperation.counter ?? defaultCounter
          delegationOperation.fee = delegationOperation.fee ?? defaultFee
          delegationOperation.gas_limit = delegationOperation.gas_limit ?? defaultGasLimit
          delegationOperation.storage_limit = delegationOperation.storage_limit ?? defaultStorageLimit

          return delegationOperation
        case TezosOperationType.TRANSACTION:
          const transactionOperation: TezosTransactionOperation = operationRequest as TezosTransactionOperation

          if (!transactionOperation.amount) {
            throw new PropertyUndefinedError(Domain.TEZOS, 'property "amount" was not defined')
          }

          if (!transactionOperation.destination) {
            throw new PropertyUndefinedError(Domain.TEZOS, 'property "destination" was not defined')
          }

          transactionOperation.source = transactionOperation.source ?? address
          transactionOperation.counter = transactionOperation.counter ?? defaultCounter
          transactionOperation.fee = transactionOperation.fee ?? defaultFee
          transactionOperation.gas_limit = transactionOperation.gas_limit ?? GAS_LIMIT_PLACEHOLDER
          transactionOperation.storage_limit = transactionOperation.storage_limit ?? STORAGE_LIMIT_PLACEHOLDER

          return transactionOperation
        case TezosOperationType.ORIGINATION:
          const originationOperation: TezosOriginationOperation = operationRequest as TezosOriginationOperation

          if (!originationOperation.balance) {
            throw new PropertyUndefinedError(Domain.TEZOS, 'property "balance" was not defined')
          }

          if (!originationOperation.script) {
            throw new PropertyUndefinedError(Domain.TEZOS, 'property "script" was not defined')
          }

          originationOperation.source = originationOperation.source ?? address
          originationOperation.counter = originationOperation.counter ?? defaultCounter
          originationOperation.fee = originationOperation.fee ?? defaultFee
          originationOperation.gas_limit = originationOperation.gas_limit ?? GAS_LIMIT_PLACEHOLDER
          originationOperation.storage_limit = originationOperation.storage_limit ?? STORAGE_LIMIT_PLACEHOLDER

          return originationOperation
        case TezosOperationType.ENDORSEMENT:
        case TezosOperationType.SEED_NONCE_REVELATION:
        case TezosOperationType.DOUBLE_ENDORSEMENT_EVIDENCE:
        case TezosOperationType.DOUBLE_BAKING_EVIDENCE:
        case TezosOperationType.ACTIVATE_ACCOUNT:
        case TezosOperationType.PROPOSALS:
        case TezosOperationType.BALLOT:
          // Do not change anything
          return operationRequest
        default:
          assertNever(operationRequest.kind)
          throw new UnsupportedError(Domain.TEZOS, `unsupported operation type "${JSON.stringify(operationRequest.kind)}"`)
      }
    })

    operations.push(...(await Promise.all(operationPromises)))

    const wrappedOperation: TezosWrappedOperation = {
      branch,
      contents: operations
    }

    return this.estimateAndReplaceLimitsAndFee(wrappedOperation, overrideParameters)
  }

  private async estimateAndReplaceLimitsAndFee(
    wrappedOperation: TezosWrappedOperation,
    overrideParameters: boolean = true,
    startingCounter?: BigNumber
  ): Promise<TezosWrappedOperation> {
    const fakeSignature: string = 'sigUHx32f9wesZ1n2BWpixXz4AQaZggEtchaQNHYGRCoWNAXx45WGW2ua3apUUUAGMLPwAU41QoaFCzVSL61VaessLg4YbbP'
    const opKinds = [
      TezosOperationType.TRANSACTION,
      TezosOperationType.REVEAL,
      TezosOperationType.ORIGINATION,
      TezosOperationType.DELEGATION
    ]
    type TezosOp = TezosTransactionOperation | TezosRevealOperation | TezosDelegationOperation | TezosOriginationOperation
    const contents = wrappedOperation.contents.map((operation, i) => {
      if (!opKinds.includes(operation.kind)) {
        return operation
      }
      const op = operation as TezosOp
      const gasValue = new BigNumber(MAX_GAS_PER_BLOCK).dividedToIntegerBy(wrappedOperation.contents.length)
      const gas_limit = new BigNumber(GAS_LIMIT_PLACEHOLDER).gt(gasValue) ? gasValue : GAS_LIMIT_PLACEHOLDER
      const counter = startingCounter ? startingCounter.plus(i).toString() : op.counter
      return { ...operation, gas_limit, counter }
    })

    const { data: block }: AxiosResponse<{ chain_id: string }> = await axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head`)
    const body = {
      chain_id: block.chain_id,
      operation: {
        branch: wrappedOperation.branch,
        contents,
        signature: fakeSignature // signature will not be checked, so it is ok to always use this one
      }
    }
    const forgedOperation: string = await this.forgeOperation(wrappedOperation)
    let gasLimitTotal: number = 0

    const response: AxiosResponse<RunOperationResponse> = await axios
      .post(`${this.options.network.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`, body, {
        headers: { 'Content-Type': 'application/json' }
      })
      .catch((runOperationError: AxiosError) => {
        throw new NetworkError(Domain.TEZOS, runOperationError)
      })

    if (wrappedOperation.contents.length !== response.data.contents.length) {
      throw new ConditionViolationError(
        Domain.TEZOS,
        `Run Operation did not return same number of operations. Locally we have ${wrappedOperation.contents.length}, but got back ${response.data.contents.length}`
      )
    }

    wrappedOperation.contents.forEach((content: TezosOperation, i: number) => {
      const metadata: RunOperationMetadata = response.data.contents[i].metadata
      if (metadata.operation_result) {
        const result: RunOperationOperationResult = metadata.operation_result
        let gasLimit: number = 0
        let storageLimit: number = 0

        // If there are internal operations, we first add gas and storage used of internal operations
        if (metadata.internal_operation_results) {
          metadata.internal_operation_results.forEach((internalOperation: RunOperationInternalOperationResult) => {
            if (internalOperation?.result) {
              if (internalOperation.result.errors) {
                throw new TransactionError(Domain.TEZOS, 'An internal operation produced an error', internalOperation.result.errors)
              }

              gasLimit += Math.ceil(Number(internalOperation.result.consumed_milligas) / 1000)

              if (internalOperation.result.paid_storage_size_diff) {
                storageLimit += Number(internalOperation.result.paid_storage_size_diff)
              }
              if (internalOperation.result.originated_contracts) {
                storageLimit += internalOperation.result.originated_contracts.length * 257
              }
              if (internalOperation.result.allocated_destination_contract) {
                storageLimit += 257
              }
            }
          })
        }

        if (result.errors) {
          throw new TransactionError(Domain.TEZOS, 'The operation produced an error', result.errors)
        }

        // Add gas and storage used by operation
        gasLimit += Math.ceil(Number(result.consumed_milligas) / 1000)

        if (result.paid_storage_size_diff) {
          storageLimit += Number(result.paid_storage_size_diff)
        }
        if (result.originated_contracts) {
          storageLimit += result.originated_contracts.length * 257
        }
        if (result.allocated_destination_contract) {
          storageLimit += 257
        }
        // in prepareTransactionsFromPublicKey() we invoke this method with overrideParameters = false
        if (((content as any).gas_limit && overrideParameters) || (content as any).gas_limit === GAS_LIMIT_PLACEHOLDER) {
          ;(content as any).gas_limit = gasLimit.toString()
        }
        if (((content as any).storage_limit && overrideParameters) || (content as any).storage_limit === STORAGE_LIMIT_PLACEHOLDER) {
          ;(content as any).storage_limit = storageLimit.toString()
        }
        gasLimitTotal += gasLimit
      }
    })

    if (overrideParameters || wrappedOperation.contents.some((operation) => (operation as any)?.fee === FEE_PLACEHOLDER)) {
      const fee: number =
        MINIMAL_FEE +
        MINIMAL_FEE_PER_BYTE * Math.ceil((forgedOperation.length + 128) / 2) + // 128 is the length of a hex signature
        MINIMAL_FEE_PER_GAS_UNIT * gasLimitTotal +
        100 // add 100 for safety

      const nonRevealOperations = wrappedOperation.contents.filter((operation) => operation.kind !== 'reveal')
      const feePerOperation: number = Math.ceil(fee / nonRevealOperations.length)

      wrappedOperation.contents.forEach((content: TezosOperation) => {
        if ((content as TezosTransactionOperation).fee && (content as TezosRevealOperation).kind !== 'reveal') {
          ;(content as TezosTransactionOperation).fee = feePerOperation.toString()
        }
      })
    }

    return wrappedOperation
  }

  private async createTransactionOperations(
    previousOperations: TezosOperation[],
    details: TransactionDetails<TezosUnits>[],
    fee: BigNumber,
    address: string,
    counter: BigNumber,
    balance: BigNumber
  ): Promise<TezosOperation[]> {
    const amountUsedByPreviousOperations: BigNumber = getAmountUsedByPreviousOperations(previousOperations)

    const operations: TezosOperation[] = []

    if (!amountUsedByPreviousOperations.isZero()) {
      const firstValue = new BigNumber(newAmount(details[0].amount).blockchain(this.units).value)
      if (balance.isLessThan(firstValue.plus(fee).plus(amountUsedByPreviousOperations))) {
        // if not, make room for the init fee
        details[0] = {
          ...details[0],
          amount: newAmount(firstValue.minus(amountUsedByPreviousOperations), 'blockchain') // deduct fee from balance
        }
      }
    }

    // TODO: We currently do not correctly calculate whether we have enough balance to pay the activation burn if there are multiple recipients
    for (let i: number = 0; i < details.length; i++) {
      const recipient: string = details[i].to
      let value: BigNumber = new BigNumber(newAmount(details[i].amount).blockchain(this.units).value)

      const { total, transferable }: Balance<TezosUnits> = await this.getBalanceOfAddress(recipient)
      const receivingBalance: BigNumber = new BigNumber(newAmount(transferable ?? total).blockchain(this.units).value)

      // if our receiver has 0 balance, the account is not activated yet.
      if (receivingBalance.isZero() && recipient.toLowerCase().startsWith('tz')) {
        // We have to supply an additional 0.257 XTZ fee for storage_limit costs, which gets automatically deducted from the sender so we just have to make sure enough balance is around
        if (balance.isLessThan(fee.plus(ACTIVATION_BURN))) {
          // If we don't have enough funds to pay the activation + fee, we throw an error
          throw new BalanceError(Domain.TEZOS, 'Insufficient balance to pay activation burn!')
        } else if (balance.isLessThan(value.plus(fee).plus(ACTIVATION_BURN))) {
          // Check whether the sender has enough to cover the amount to send + fee + activation
          // If not, we deduct it from amount sent to make room for the activation burn
          value = value.minus(ACTIVATION_BURN) // deduct fee from balance
        }
      }

      if (balance.isEqualTo(value.plus(fee))) {
        // Tezos accounts can never be empty. If user tries to send everything, we must leave 1 mutez behind.
        value = value.minus(1)
      } else if (balance.isLessThan(value.plus(fee))) {
        throw new BalanceError(Domain.TEZOS, 'not enough balance')
      }

      const spendOperation: TezosTransactionOperation = {
        kind: TezosOperationType.TRANSACTION,
        fee: fee.toFixed(),
        gas_limit: GAS_LIMIT_PLACEHOLDER,
        storage_limit: STORAGE_LIMIT_PLACEHOLDER,
        amount: value.toFixed(),
        counter: counter.plus(i).toFixed(),
        destination: recipient,
        source: address
      }

      operations.push(spendOperation)
    }

    return operations
  }
}

// Factory

export function createTezosProtocol(options: RecursivePartial<TezosProtocolOptions> = {}): TezosProtocol {
  return new TezosProtocolImpl(options)
}

export const TEZOS_MAINNET_PROTOCOL_NETWORK: TezosProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://tezos-node.prod.gke.papers.tech',
  network: TezosNetwork.MAINNET,
  blockExplorer: {
    type: 'tzkt',
    url: 'https://tzkt.io'
  },
  indexer: {
    type: 'tzkt',
    apiUrl: 'https://tezos-mainnet-indexer.prod.gke.papers.tech'
  }
}

export const TEZOS_GHOSTNET_PROTOCOL_NETWORK: TezosProtocolNetwork = {
  name: 'Ghostnet',
  type: 'testnet',
  rpcUrl: 'https://tezos-ghostnet-node.prod.gke.papers.tech',
  network: TezosNetwork.GHOSTNET,
  blockExplorer: {
    type: 'tzkt',
    url: 'https://ghostnet.tzkt.io'
  },
  indexer: {
    type: 'tzkt',
    apiUrl: 'https://tezos-ghostnet-indexer.prod.gke.papers.tech'
  }
}

const DEFAULT_TEZOS_PROTOCOL_NETWORK: TezosProtocolNetwork = TEZOS_MAINNET_PROTOCOL_NETWORK

export function createTezosProtocolOptions(network: RecursivePartial<TezosProtocolNetwork> = {}): TezosProtocolOptions {
  return {
    network: {
      ...DEFAULT_TEZOS_PROTOCOL_NETWORK,
      ...network,
      blockExplorer: {
        ...DEFAULT_TEZOS_PROTOCOL_NETWORK.blockExplorer,
        ...network.blockExplorer
      },
      indexer: {
        ...DEFAULT_TEZOS_PROTOCOL_NETWORK.indexer,
        ...network.indexer
      }
    }
  }
}
