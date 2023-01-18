import { ICoinSubProtocol } from '@airgap/coinlib-core'
import { localForger } from '@airgap/coinlib-core/dependencies/src/@taquito/local-forging-15.0.1/packages/taquito-local-forging/src/taquito-local-forging'
import axios, { AxiosError, AxiosResponse } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
// @ts-ignore
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index'
// @ts-ignore
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { generateWalletUsingDerivationPath } from '@airgap/coinlib-core/dependencies/src/hd-wallet-js-b216450e56954a6e82ace0aade9474673de5d9d5/src/index'
import { CoinlibError, Domain } from '@airgap/coinlib-core/errors/coinlib-error'
import {
  BalanceError,
  ConditionViolationError,
  NetworkError,
  NotFoundError,
  OperationFailedError,
  PropertyUndefinedError,
  ProtocolErrorType,
  TransactionError,
  UnsupportedError
} from '@airgap/coinlib-core/errors/index'
import { IAirGapSignedTransaction } from '@airgap/coinlib-core/interfaces/IAirGapSignedTransaction'
import { AirGapTransactionStatus, IAirGapTransaction } from '@airgap/coinlib-core/interfaces/IAirGapTransaction'
import {
  DelegateeDetails,
  DelegationDetails,
  DelegatorAction,
  DelegatorDetails,
  ICoinDelegateProtocol
} from '@airgap/coinlib-core/protocols/ICoinDelegateProtocol'
import { CurrencyUnit, FeeDefaults } from '@airgap/coinlib-core/protocols/ICoinProtocol'
import { NonExtendedProtocol } from '@airgap/coinlib-core/protocols/NonExtendedProtocol'
import { assertNever } from '@airgap/coinlib-core/utils/assert'
import { MainProtocolSymbols, ProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'

import { SignedTezosTransaction } from '../types/signed-transaction-tezos'
import { RawTezosTransaction } from '../types/transaction-tezos'
import { UnsignedTezosTransaction } from '../types/unsigned-transaction-tezos'

import { TezosAddress } from './TezosAddress'
import { TezosCryptoClient } from './TezosCryptoClient'
import { TezosProtocolOptions } from './TezosProtocolOptions'
import { TezosUtils } from './TezosUtils'
import { TezosDelegationOperation } from './types/operations/Delegation'
import { TezosOriginationOperation } from './types/operations/Origination'
import { TezosRevealOperation } from './types/operations/Reveal'
import { TezosOperation } from './types/operations/TezosOperation'
import { TezosTransactionOperation } from './types/operations/Transaction'
import { TezosAddressCursor } from './types/TezosAddressCursor'
import { TezosAddressResult } from './types/TezosAddressResult'
import { TezosOperationType } from './types/TezosOperationType'
import { TezosTransactionCursor } from './types/TezosTransactionCursor'
import { TezosTransactionResult } from './types/TezosTransactionResult'
import { TezosWrappedOperation } from './types/TezosWrappedOperation'

const MAX_OPERATIONS_PER_GROUP: number = 200
const MAX_GAS_PER_BLOCK: number = 5200000
const GAS_LIMIT_PLACEHOLDER: string = '1040000'
const STORAGE_LIMIT_PLACEHOLDER: string = '60000'
const FEE_PLACEHOLDER: string = '0'

const MINIMAL_FEE: number = 100
const MINIMAL_FEE_PER_GAS_UNIT: number = 0.1
const MINIMAL_FEE_PER_BYTE: number = 1

export interface TezosVotingInfo {
  pkh: string
  rolls: number
}

export interface BakerInfo {
  balance: BigNumber
  delegatedBalance: BigNumber
  stakingBalance: BigNumber
  selfBond: BigNumber
  bakerCapacity: BigNumber
  bakerUsage: BigNumber
}

export interface DelegationRewardInfo {
  cycle: number
  reward: BigNumber
  deposit: BigNumber
  delegatedBalance: BigNumber
  stakingBalance: BigNumber
  totalRewards: BigNumber
  totalFees: BigNumber
  payout: Date
}

export interface DelegationInfo {
  isDelegated: boolean
  value?: string
  delegatedOpLevel?: number
  delegatedDate?: Date
}

export enum TezosDelegatorAction {
  DELEGATE = 'delegate',
  UNDELEGATE = 'undelegate',
  CHANGE_BAKER = 'change_baker'
}

export interface TezosPayoutInfo {
  delegator: string
  share: string
  payout: string
  balance: string
}

// run_operation response
export interface RunOperationBalanceUpdate {
  kind: string
  contract: string
  change: string
  category: string
  delegate: string
  cycle?: number
}

export interface RunOperationOperationBalanceUpdate {
  kind: string
  contract: string
  change: string
}

export interface RunOperationOperationResult {
  status: string
  errors?: unknown
  balance_updates: RunOperationOperationBalanceUpdate[]
  consumed_milligas: string
  paid_storage_size_diff?: string
  originated_contracts?: string[]
  allocated_destination_contract?: boolean
}

interface RunOperationInternalOperationResult {
  result?: {
    errors?: unknown
    consumed_milligas: string
    paid_storage_size_diff?: string
    originated_contracts?: string[]
    allocated_destination_contract?: boolean
  }
  parameters?: {
    entrypoint: string
    value: unknown
  }
}

export interface RunOperationMetadata {
  balance_updates: RunOperationBalanceUpdate[]
  operation_result: RunOperationOperationResult
  internal_operation_results?: RunOperationInternalOperationResult[]
}

interface RunOperationResponse {
  contents: (TezosOperation & {
    metadata: RunOperationMetadata
  })[]
  signature: string
}

// 8.25%
const SELF_BOND_REQUIREMENT: number = 0.0825

export enum TezosNetwork {
  MAINNET = 'mainnet',
  GHOSTNET = 'ghostnet'
}

export class TezosProtocol extends NonExtendedProtocol implements ICoinDelegateProtocol {
  public symbol: string = 'XTZ'
  public name: string = 'Tezos'
  public marketSymbol: string = 'xtz'
  public feeSymbol: string = 'xtz'

  public decimals: number = 6
  public feeDecimals: number = 6 // micro tez is the smallest, 1000000 microtez is 1 tez
  public identifier: ProtocolSymbols = MainProtocolSymbols.XTZ

  // tezbox default
  public feeDefaults: FeeDefaults = {
    low: '0.001420',
    medium: '0.001520',
    high: '0.003000'
  }

  public units: CurrencyUnit[] = [
    {
      unitSymbol: 'XTZ',
      factor: '1'
    }
  ]

  public supportsHD: boolean = false
  public standardDerivationPath: string = `m/44h/1729h/0h/0h`

  public addressIsCaseSensitive: boolean = true
  public addressValidationPattern: string = '^((tz1|tz2|tz3|KT1)[1-9A-Za-z]{33}|zet1[1-9A-Za-z]{65})$'
  public addressPlaceholder: string = 'tz1...'

  // https://gitlab.com/tezos/tezos/-/blob/master/docs/whitedoc/proof_of_stake.rst
  // cycle has 4096 blocks, which are at least one minute apart
  public minCycleDuration: number = 4096 * 60 * 1000 // ms

  protected readonly transactionFee: BigNumber = new BigNumber('1400')
  protected readonly originationSize: BigNumber = new BigNumber('257')
  protected readonly storageCostPerByte: BigNumber = new BigNumber('1000')

  protected readonly revealFee: BigNumber = new BigNumber('1300')
  protected readonly activationBurn: BigNumber = this.originationSize.times(this.storageCostPerByte)
  protected readonly originationBurn: BigNumber = this.originationSize.times(this.storageCostPerByte) // https://tezos.stackexchange.com/a/787

  public readonly cryptoClient: TezosCryptoClient = new TezosCryptoClient(TezosUtils.tezosPrefixes.edsig)

  // TODO: Should we remove these getters and replace the calls to `this.options.network...`?
  public get jsonRPCAPI(): string {
    return this.options.network.rpcUrl
  }

  constructor(public readonly options: TezosProtocolOptions = new TezosProtocolOptions()) {
    super()
  }

  public async getSymbol(): Promise<string> {
    return this.symbol
  }

  public async getName(): Promise<string> {
    return this.name
  }

  public async getMarketSymbol(): Promise<string> {
    return this.marketSymbol
  }

  public async getFeeSymbol(): Promise<string> {
    return this.feeSymbol
  }

  public async getDecimals(): Promise<number> {
    return this.decimals
  }

  public async getFeeDecimals(): Promise<number> {
    return this.feeDecimals
  }

  public async getIdentifier(): Promise<ProtocolSymbols> {
    return this.identifier
  }

  public async getFeeDefaults(): Promise<FeeDefaults> {
    return this.feeDefaults
  }

  public async getUnits(): Promise<CurrencyUnit[]> {
    return this.units
  }

  public async getSupportsHD(): Promise<boolean> {
    return this.supportsHD
  }

  public async getStandardDerivationPath(): Promise<string> {
    return this.standardDerivationPath
  }

  public async getAddressIsCaseSensitive(): Promise<boolean> {
    return this.addressIsCaseSensitive
  }

  public async getAddressValidationPattern(): Promise<string> {
    return this.addressValidationPattern
  }

  public async getAddressPlaceholder(): Promise<string> {
    return this.addressPlaceholder
  }

  public async getOptions(): Promise<TezosProtocolOptions> {
    return this.options
  }

  public async getBlockExplorerLinkForAddress(address: string): Promise<string> {
    return this.options.network.blockExplorer.getAddressLink(address)
  }

  public async getBlockExplorerLinkForTxId(txId: string): Promise<string> {
    return this.options.network.blockExplorer.getTransactionLink(txId)
  }

  public async getPublicKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getPublicKeyFromHexSecret(secret, derivationPath)
  }

  public async getPrivateKeyFromMnemonic(mnemonic: string, derivationPath: string, password?: string): Promise<string> {
    const secret = mnemonicToSeed(mnemonic, password)

    return this.getPrivateKeyFromHexSecret(secret, derivationPath)
  }

  /**
   * Returns the PublicKey as String, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  public async getPublicKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    // both AE and Tezos use the same ECC curves (ed25519)
    const { publicKey }: { publicKey: string } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath) as any // TODO: Look into typings

    return Buffer.from(publicKey).toString('hex')
  }

  /**
   * Returns the PrivateKey as Buffer, derived from a supplied hex-string
   * @param secret HEX-Secret from BIP39
   * @param derivationPath DerivationPath for Key
   */
  public async getPrivateKeyFromHexSecret(secret: string, derivationPath: string): Promise<string> {
    // both AE and Tezos use the same ECC curves (ed25519)
    const { secretKey }: { secretKey: string } = generateWalletUsingDerivationPath(Buffer.from(secret, 'hex'), derivationPath) as any // TODO: Look into typings

    return Buffer.from(secretKey).toString('hex')
  }

  public async getAddressFromPublicKey(publicKey: string, cursor?: TezosAddressCursor): Promise<TezosAddressResult> {
    const address: TezosAddress = await TezosAddress.fromPublicKey(publicKey)

    return {
      address: address.asString(),
      cursor: { hasNext: false }
    }
  }

  public async getAddressesFromPublicKey(publicKey: string, cursor?: TezosAddressCursor): Promise<TezosAddressResult[]> {
    const address: TezosAddressResult = await this.getAddressFromPublicKey(publicKey, cursor)

    return [address]
  }

  public async getTransactionsFromPublicKey(
    publicKey: string,
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<TezosTransactionResult> {
    const addresses: string[] = await this.getAddressesFromPublicKey(publicKey).then((addresses: TezosAddressResult[]) =>
      addresses.map((address: TezosAddressResult) => address.address)
    )

    return this.getTransactionsFromAddresses(addresses, limit, cursor)
  }

  public async getTransactionsFromAddresses(
    addresses: string[],
    limit: number,
    cursor?: TezosTransactionCursor
  ): Promise<TezosTransactionResult> {
    const address = addresses[0]
    const results = await this.options.network.extras.indexerClient.getTransactions(address, limit, cursor?.offset)
    return {
      transactions: results.map((transaction) => ({
        ...transaction,
        protocolIdentifier: this.identifier,
        network: this.options.network
      })),
      cursor: { offset: (cursor?.offset ?? 0) + results.length }
    }
  }

  public async signWithPrivateKey(privateKey: string, transaction: RawTezosTransaction): Promise<IAirGapSignedTransaction> {
    const opSignature: Buffer = await this.cryptoClient.operationSignature(Buffer.from(privateKey, 'hex'), transaction)
    const signedOpBytes: Buffer = Buffer.concat([Buffer.from(transaction.binaryTransaction, 'hex'), Buffer.from(opSignature)])

    return signedOpBytes.toString('hex')
  }

  public async getTransactionDetails(unsignedTx: UnsignedTezosTransaction): Promise<IAirGapTransaction[]> {
    const binaryTransaction: string = unsignedTx.transaction.binaryTransaction
    const wrappedOperations: TezosWrappedOperation = await this.unforgeUnsignedTezosWrappedOperation(binaryTransaction)

    return this.getAirGapTxFromWrappedOperations(wrappedOperations)
  }

  public async getTransactionDetailsFromSigned(signedTx: SignedTezosTransaction): Promise<IAirGapTransaction[]> {
    const binaryTransaction: string = signedTx.transaction
    const wrappedOperations: TezosWrappedOperation = await this.unforgeSignedTezosWrappedOperation(binaryTransaction)

    return this.getAirGapTxFromWrappedOperations(wrappedOperations)
  }

  public async getAirGapTxFromWrappedOperations(wrappedOperations: TezosWrappedOperation): Promise<IAirGapTransaction[]> {
    const assertNever: (x: never) => void = (_x: never): void => undefined

    return Promise.all(
      wrappedOperations.contents.map(async (tezosOperation: TezosOperation) => {
        let operation: TezosRevealOperation | TezosTransactionOperation | TezosOriginationOperation | TezosDelegationOperation | undefined

        let partialTxs: Partial<IAirGapTransaction>[] = []

        switch (tezosOperation.kind) {
          case TezosOperationType.REVEAL:
            operation = tezosOperation as TezosRevealOperation
            partialTxs = [
              {
                from: [operation.source],
                to: ['Reveal']
              }
            ]
            break
          case TezosOperationType.TRANSACTION:
            const tezosSpendOperation: TezosTransactionOperation = tezosOperation as TezosTransactionOperation
            operation = tezosSpendOperation
            partialTxs = (await this.getTransactionOperationDetails(tezosSpendOperation)).map((tx: Partial<IAirGapTransaction>) => ({
              ...tx,
              extra: {
                ...tx.extra,
                parameters: tezosSpendOperation.parameters
              }
            }))
            break
          case TezosOperationType.ORIGINATION:
            {
              const tezosOriginationOperation: TezosOriginationOperation = tezosOperation as TezosOriginationOperation
              operation = tezosOriginationOperation
              const delegate: string | undefined = tezosOriginationOperation.delegate
              partialTxs = [
                {
                  from: [operation.source],
                  amount: new BigNumber(tezosOriginationOperation.balance).toFixed(),
                  to: [delegate ? `Delegate: ${delegate}` : 'Origination']
                }
              ]
            }
            break
          case TezosOperationType.DELEGATION:
            {
              operation = tezosOperation as TezosDelegationOperation
              const delegate: string | undefined = operation.delegate
              partialTxs = [
                {
                  from: [operation.source],
                  to: [delegate ? delegate : 'Undelegate']
                }
              ]
            }
            break
          case TezosOperationType.ENDORSEMENT:
          case TezosOperationType.SEED_NONCE_REVELATION:
          case TezosOperationType.DOUBLE_ENDORSEMENT_EVIDENCE:
          case TezosOperationType.DOUBLE_BAKING_EVIDENCE:
          case TezosOperationType.ACTIVATE_ACCOUNT:
          case TezosOperationType.PROPOSALS:
          case TezosOperationType.BALLOT:
            throw new UnsupportedError(Domain.TEZOS, 'operation not supported: ' + JSON.stringify(tezosOperation.kind))
          default:
            // Exhaustive switch
            assertNever(tezosOperation.kind)
            throw new NotFoundError(Domain.TEZOS, 'no operation to unforge found')
        }

        return partialTxs.map((partialTx: Partial<IAirGapTransaction>) => {
          return {
            amount: '0',
            fee: operation !== undefined ? new BigNumber(operation.fee).toString(10) : '0',
            from: [],
            isInbound: false,
            protocolIdentifier: this.identifier,
            network: this.options.network,
            to: [],
            transactionDetails: tezosOperation,
            ...partialTx
          }
        })
      })
    ).then((airGapTxs: IAirGapTransaction[][]) =>
      airGapTxs.reduce((flatten: IAirGapTransaction[], next: IAirGapTransaction[]) => flatten.concat(next), [])
    )
  }

  public async getBalanceOfAddresses(addresses: string[], _data?: any): Promise<string> {
    let balance: BigNumber = new BigNumber(0)

    for (const address of addresses) {
      try {
        const { data }: AxiosResponse = await axios.get(
          `${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}/balance`
        )
        balance = balance.plus(new BigNumber(data))
      } catch (error: any) {
        // if node returns 404 (which means 'no account found'), go with 0 balance
        if (error.response && error.response.status !== 404) {
          throw new NetworkError(Domain.TEZOS, error as AxiosError)
        }
      }
    }

    return balance.toString(10)
  }

  public async getBalanceOfPublicKey(publicKey: string, data?: any): Promise<string> {
    const address: TezosAddressResult = await this.getAddressFromPublicKey(publicKey)

    return this.getBalanceOfAddresses([address.address], data)
  }

  public async getBalanceOfPublicKeyForSubProtocols(publicKey: string, subProtocols: ICoinSubProtocol[]): Promise<string[]> {
    return Promise.all(subProtocols.map((subProtocol) => subProtocol.getBalanceOfPublicKey(publicKey).catch(() => '0')))
  }

  public async getAvailableBalanceOfAddresses(addresses: string[], data?: any): Promise<string> {
    return this.getBalanceOfAddresses(addresses, data)
  }

  public async estimateMaxTransactionValueFromPublicKey(publicKey: string, recipients: string[], fee?: string): Promise<string> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const balanceWrapper = new BigNumber(balance).minus(1) // Tezos accounts can never be empty. We must leave at least 1 mutez behind.

    return this.estimateMaxTansactionValueWithBalance(publicKey, balanceWrapper, recipients, fee)
  }

  private async estimateMaxTansactionValueWithBalance(
    publicKey: string,
    balance: BigNumber,
    recipients: string[],
    fee?: string
  ): Promise<string> {
    let maxFee: BigNumber = new BigNumber(0)
    if (fee !== undefined) {
      maxFee = new BigNumber(fee)
    } else {
      try {
        const estimatedFeeDefaults = await this.estimateFeeDefaultsFromPublicKey(publicKey, recipients, [balance.toFixed()])
        maxFee = new BigNumber(estimatedFeeDefaults.medium).shiftedBy(this.decimals)
        if (maxFee.gte(balance)) {
          maxFee = new BigNumber(0)
        }
      } catch (error: any) {
        if (error.code !== undefined && error.code === ProtocolErrorType.TRANSACTION_FAILED && Array.isArray(error.data)) {
          const rpcErrors = error.data as { id: string; kind: string; amount?: string; balance?: string; contract?: string }[]
          const balanceTooLowError = rpcErrors.find((error) => error.id.endsWith('.contract.balance_too_low'))
          if (balanceTooLowError !== undefined && balanceTooLowError.amount !== undefined && balanceTooLowError.balance !== undefined) {
            const excess = new BigNumber(balanceTooLowError.amount).minus(new BigNumber(balanceTooLowError.balance).minus(1))
            const newMaxBalance = balance.minus(excess)
            if (newMaxBalance.gt(0)) {
              return this.estimateMaxTansactionValueWithBalance(publicKey, newMaxBalance, recipients, fee)
            }
          }
        }
        throw error as CoinlibError
      }
    }

    let amountWithoutFees = balance.minus(maxFee)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return amountWithoutFees.toFixed()
  }

  public async estimateFeeDefaultsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    _data?: any
  ): Promise<FeeDefaults> {
    if (recipients.length !== values.length) {
      throw new ConditionViolationError(Domain.TEZOS, 'length of recipients and values does not match!')
    }
    const operations: TezosOperation[] = []
    for (let i = 0; i < values.length; ++i) {
      const recipient = recipients[i]
      const transaction: Partial<TezosTransactionOperation> = {
        kind: TezosOperationType.TRANSACTION,
        amount: values[i],
        destination: recipient,
        fee: '0'
      }
      operations.push(transaction as TezosOperation)
    }
    if (recipients.length === 0) {
      return this.feeDefaults
    }

    return this.estimateFeeDefaultsForOperations(publicKey, operations)
  }

  public async estimateFeeDefaultsForOperations(publicKey: string, operations: TezosOperation[]): Promise<FeeDefaults> {
    const estimated = await this.prepareOperations(publicKey, operations)
    const hasReveal = estimated.contents.some((op) => op.kind === TezosOperationType.REVEAL)
    const estimatedFee = estimated.contents
      .reduce((current, next: any) => {
        if (next.fee !== undefined) {
          return current.plus(new BigNumber(next.fee))
        }

        return current
      }, new BigNumber(0))
      .minus(hasReveal ? this.revealFee : 0)
      .div(hasReveal ? estimated.contents.length - 1 : estimated.contents.length)

    const feeStepFactor = new BigNumber(0.2)
    const lowFee = estimatedFee
    const mediumFee = lowFee.plus(lowFee.times(feeStepFactor).integerValue(BigNumber.ROUND_FLOOR))
    const highFee = mediumFee.plus(mediumFee.times(feeStepFactor).integerValue(BigNumber.ROUND_FLOOR))

    return {
      low: lowFee.shiftedBy(-this.feeDecimals).toFixed(),
      medium: mediumFee.shiftedBy(-this.feeDecimals).toFixed(),
      high: highFee.shiftedBy(-this.feeDecimals).toFixed()
    }
  }

  public async prepareTransactionFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number }
  ): Promise<RawTezosTransaction> {
    if (recipients.length !== values.length) {
      throw new ConditionViolationError(Domain.TEZOS, 'length of recipients and values does not match!')
    }

    if (recipients.length > MAX_OPERATIONS_PER_GROUP) {
      throw new ConditionViolationError(
        Domain.TEZOS,
        `this transaction exceeds the maximum allowed number of transactions per operation (${MAX_OPERATIONS_PER_GROUP}). Please use the "prepareTransactionsFromPublicKey" method instead.`
      )
    }

    const transactions: RawTezosTransaction[] = await this.prepareTransactionsFromPublicKey(publicKey, recipients, values, fee, data)
    if (transactions.length === 1) {
      return transactions[0]
    } else {
      throw new ConditionViolationError(
        Domain.TEZOS,
        'Transaction could not be prepared. More or less than 1 operations have been generated.'
      )
    }
  }

  public async prepareTransactionsFromPublicKey(
    publicKey: string,
    recipients: string[],
    values: string[],
    fee: string,
    data?: { addressIndex: number },
    operationsPerGroup: number = MAX_OPERATIONS_PER_GROUP
  ): Promise<RawTezosTransaction[]> {
    const wrappedValues: BigNumber[] = values.map((value: string) => new BigNumber(value))
    const wrappedFee: BigNumber = new BigNumber(fee)

    if (recipients.length !== wrappedValues.length) {
      throw new ConditionViolationError(Domain.TEZOS, 'length of recipients and values does not match!')
    }

    const operations: TezosOperation[] = []

    // check if we got an address-index
    const addressIndex: number = data && data.addressIndex ? data.addressIndex : 0
    const addresses: string[] = await this.getAddressesFromPublicKey(publicKey).then((addresses: TezosAddressResult[]) =>
      addresses.map((address: TezosAddressResult) => address.address)
    )

    if (!addresses[addressIndex]) {
      throw new NotFoundError(Domain.TEZOS, 'no kt-address with this index exists')
    }

    const address: string = addresses[addressIndex]

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
      operations.push(await this.createRevealOperation(counter, publicKey, address))
      counter = counter.plus(1)
    }

    const balance: BigNumber = new BigNumber(await this.getBalanceOfPublicKey(publicKey))

    const wrappedOperations: RawTezosTransaction[] = []

    let allOperations = await this.createTransactionOperations(operations, recipients, wrappedValues, wrappedFee, address, counter, balance)
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

      wrappedOperations.push(await this.forgeAndWrapOperations(wrappedOperationWithEstimatedGas))
    }

    return wrappedOperations
  }

  protected async getTransactionOperationDetails(transactionOperation: TezosTransactionOperation): Promise<Partial<IAirGapTransaction>[]> {
    return [
      {
        from: [transactionOperation.source],
        amount: new BigNumber(transactionOperation.amount).toFixed(),
        to: [transactionOperation.destination] // contract destination but should be the address of actual receiver
      }
    ]
  }

  private async createTransactionOperations(
    previousOperations: TezosOperation[],
    recipients: string[],
    wrappedValues: BigNumber[],
    wrappedFee: BigNumber,
    address: string,
    counter: BigNumber,
    balance: BigNumber
  ): Promise<TezosOperation[]> {
    const amountUsedByPreviousOperations: BigNumber = this.getAmountUsedByPreviousOperations(previousOperations)

    const operations: TezosOperation[] = []

    if (!amountUsedByPreviousOperations.isZero()) {
      if (balance.isLessThan(wrappedValues[0].plus(wrappedFee).plus(amountUsedByPreviousOperations))) {
        // if not, make room for the init fee
        wrappedValues[0] = wrappedValues[0].minus(amountUsedByPreviousOperations) // deduct fee from balance
      }
    }

    // TODO: We currently do not correctly calculate whether we have enough balance to pay the activation burn if there are multiple recipients
    for (let i: number = 0; i < recipients.length; i++) {
      const receivingBalance: BigNumber = new BigNumber(await this.getBalanceOfAddresses([recipients[i]]))

      // if our receiver has 0 balance, the account is not activated yet.
      if (receivingBalance.isZero() && recipients[i].toLowerCase().startsWith('tz')) {
        // We have to supply an additional 0.257 XTZ fee for storage_limit costs, which gets automatically deducted from the sender so we just have to make sure enough balance is around
        if (balance.isLessThan(this.activationBurn.plus(wrappedFee))) {
          // If we don't have enough funds to pay the activation + fee, we throw an error
          throw new BalanceError(Domain.TEZOS, 'Insufficient balance to pay activation burn!')
        } else if (balance.isLessThan(wrappedValues[i].plus(wrappedFee).plus(this.activationBurn))) {
          // Check whether the sender has enough to cover the amount to send + fee + activation
          // If not, we deduct it from amount sent to make room for the activation burn
          wrappedValues[i] = wrappedValues[i].minus(this.activationBurn) // deduct fee from balance
        }
      }

      if (balance.isEqualTo(wrappedValues[i].plus(wrappedFee))) {
        // Tezos accounts can never be empty. If user tries to send everything, we must leave 1 mutez behind.
        wrappedValues[i] = wrappedValues[i].minus(1)
      } else if (balance.isLessThan(wrappedValues[i].plus(wrappedFee))) {
        throw new BalanceError(Domain.TEZOS, 'not enough balance')
      }

      const spendOperation: TezosTransactionOperation = {
        kind: TezosOperationType.TRANSACTION,
        fee: wrappedFee.toFixed(),
        gas_limit: GAS_LIMIT_PLACEHOLDER,
        storage_limit: STORAGE_LIMIT_PLACEHOLDER,
        amount: wrappedValues[i].toFixed(),
        counter: counter.plus(i).toFixed(),
        destination: recipients[i],
        source: address
      }

      operations.push(spendOperation)
    }

    return operations
  }

  public async forgeAndWrapOperations(tezosWrappedOperation: TezosWrappedOperation): Promise<RawTezosTransaction> {
    try {
      const binaryTx: string = await this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error: any) {
      throw new OperationFailedError(Domain.TEZOS, `Forging Tezos TX failed with ${JSON.stringify(error.message)}`)
    }
  }

  public async getDefaultDelegatee(): Promise<string> {
    const { data: activeBakers } = await axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/delegates?active`)

    return activeBakers[0] || ''
  }

  public async getCurrentDelegateesForPublicKey(publicKey: string): Promise<string[]> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getCurrentDelegateesForAddress(address.address)
  }

  public async getCurrentDelegateesForAddress(address: string): Promise<string[]> {
    const { data } = await axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}`)

    return data.delegate ? [data.delegate] : []
  }

  public async getDelegateeDetails(address: string): Promise<DelegateeDetails> {
    const response: AxiosResponse = await axios.get(
      `${this.options.network.rpcUrl}/chains/main/blocks/head/context/delegates/${address}/deactivated`
    )
    const isBakingActive: boolean = !response.data

    return {
      status: isBakingActive ? 'Active' : 'Inactive',
      address
    }
  }

  public async isPublicKeyDelegating(publicKey: string): Promise<boolean> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.isAddressDelegating(address.address)
  }

  public async isAddressDelegating(address: string): Promise<boolean> {
    const { data } = await axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}`)

    return !!data.delegate
  }

  public async getDelegatorDetailsFromPublicKey(publicKey: string): Promise<DelegatorDetails> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegatorDetailsFromAddress(address.address)
  }

  public async getDelegatorDetailsFromAddress(address: string): Promise<DelegatorDetails> {
    return this.getDelegatorDetails(address)
  }

  public async getDelegationDetailsFromPublicKey(publicKey: string, delegatees: string[]): Promise<DelegationDetails> {
    const address = await this.getAddressFromPublicKey(publicKey)

    return this.getDelegationDetailsFromAddress(address.address, delegatees)
  }

  public async getDelegationDetailsFromAddress(address: string, delegatees: string[]): Promise<DelegationDetails> {
    if (delegatees.length > 1) {
      return Promise.reject('Multiple delegation is not supported.')
    }

    const bakerAddress = delegatees[0]

    const results = await Promise.all([this.getDelegatorDetails(address, bakerAddress), this.getDelegateeDetails(bakerAddress)])

    const delegatorDetails = results[0]
    const bakerDetails = results[1]

    return {
      delegator: delegatorDetails,
      delegatees: [bakerDetails]
    }
  }

  private async getDelegatorDetails(address: string, bakerAddress?: string): Promise<DelegatorDetails> {
    const results = await Promise.all([
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${address}`)
      // this.getDelegationRewardsForAddress(address).catch(() => [] as DelegationRewardInfo[])
    ])

    const accountDetails = results[0].data
    // const rewardInfo = results[1]

    const balance = accountDetails.balance
    const isDelegating = !!accountDetails.delegate
    const availableActions: DelegatorAction[] = []

    if (!isDelegating) {
      availableActions.push({
        type: TezosDelegatorAction.DELEGATE,
        args: ['delegate']
      })
    } else if (!bakerAddress || accountDetails.delegate === bakerAddress) {
      availableActions.push({
        type: TezosDelegatorAction.UNDELEGATE
      })
    } else {
      availableActions.push({
        type: TezosDelegatorAction.CHANGE_BAKER,
        args: ['delegate']
      })
    }

    // const rewards = isDelegating
    //   ? rewardInfo.map((reward) => ({
    //       index: reward.cycle,
    //       amount: reward.reward.toFixed(),
    //       collected: reward.payout < new Date(),
    //       timestamp: reward.payout.getTime()
    //     }))
    //   : []

    return {
      address,
      balance,
      delegatees: [accountDetails.delegate],
      availableActions
      // rewards
    }
  }

  public async prepareDelegatorActionFromPublicKey(
    publicKey: string,
    type: TezosDelegatorAction,
    data?: any
  ): Promise<RawTezosTransaction[]> {
    switch (type) {
      case TezosDelegatorAction.DELEGATE:
      case TezosDelegatorAction.CHANGE_BAKER:
        if (!data || !data.delegate) {
          return Promise.reject(`Invalid arguments passed for ${type} action, delegate is missing.`)
        }

        return [await this.delegate(publicKey, data.delegate)]
      case TezosDelegatorAction.UNDELEGATE:
        return [await this.undelegate(publicKey)]
      default:
        return Promise.reject('Unsupported delegator action.')
    }
  }

  public async prepareOperations(
    publicKey: string,
    operationRequests: TezosOperation[],
    overrideParameters: boolean = true
  ): Promise<TezosWrappedOperation> {
    let counter: BigNumber = new BigNumber(1)
    let branch: string
    const operations: TezosOperation[] = []

    const address: string = await this.getAddressFromPublicKey(publicKey).then((address: TezosAddressResult) => address.address)

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
      operations.push(await this.createRevealOperation(counter, publicKey, address))
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
        receivingBalance = new BigNumber(await this.getBalanceOfAddresses([recipient]))
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

    const tezosWrappedOperation: TezosWrappedOperation = {
      branch,
      contents: operations
    }

    return await this.estimateAndReplaceLimitsAndFee(tezosWrappedOperation, overrideParameters)
  }

  public async estimateAndReplaceLimitsAndFee(
    tezosWrappedOperation: TezosWrappedOperation,
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
    const contents = tezosWrappedOperation.contents.map((operation, i) => {
      if (!opKinds.includes(operation.kind)) {
        return operation
      }
      const op = operation as TezosOp
      const gasValue = new BigNumber(MAX_GAS_PER_BLOCK).dividedToIntegerBy(tezosWrappedOperation.contents.length)
      const gas_limit = new BigNumber(GAS_LIMIT_PLACEHOLDER).gt(gasValue) ? gasValue : GAS_LIMIT_PLACEHOLDER
      const counter = startingCounter ? startingCounter.plus(i).toString() : op.counter
      return { ...operation, gas_limit, counter }
    })

    const { data: block }: AxiosResponse<{ chain_id: string }> = await axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head`)
    const body = {
      chain_id: block.chain_id,
      operation: {
        branch: tezosWrappedOperation.branch,
        contents: contents,
        signature: fakeSignature // signature will not be checked, so it is ok to always use this one
      }
    }
    const forgedOperation: string = await this.forgeTezosOperation(tezosWrappedOperation)
    let gasLimitTotal: number = 0

    const response: AxiosResponse<RunOperationResponse> = await axios
      .post(`${this.options.network.rpcUrl}/chains/main/blocks/head/helpers/scripts/run_operation`, body, {
        headers: { 'Content-Type': 'application/json' }
      })
      .catch((runOperationError: AxiosError) => {
        throw new NetworkError(Domain.TEZOS, runOperationError)
      })

    if (tezosWrappedOperation.contents.length !== response.data.contents.length) {
      throw new ConditionViolationError(
        Domain.TEZOS,
        `Run Operation did not return same number of operations. Locally we have ${tezosWrappedOperation.contents.length}, but got back ${response.data.contents.length}`
      )
    }

    tezosWrappedOperation.contents.forEach((content: TezosOperation, i: number) => {
      const metadata: RunOperationMetadata = response.data.contents[i].metadata
      if (metadata.operation_result) {
        const operation: TezosOperation = content

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
        if (((operation as any).gas_limit && overrideParameters) || (operation as any).gas_limit === GAS_LIMIT_PLACEHOLDER) {
          ;(operation as any).gas_limit = gasLimit.toString()
        }
        if (((operation as any).storage_limit && overrideParameters) || (operation as any).storage_limit === STORAGE_LIMIT_PLACEHOLDER) {
          ;(operation as any).storage_limit = storageLimit.toString()
        }
        gasLimitTotal += gasLimit
      }
    })

    if (overrideParameters || tezosWrappedOperation.contents.some((operation) => (operation as any)?.fee === FEE_PLACEHOLDER)) {
      const fee: number =
        MINIMAL_FEE +
        MINIMAL_FEE_PER_BYTE * Math.ceil((forgedOperation.length + 128) / 2) + // 128 is the length of a hex signature
        MINIMAL_FEE_PER_GAS_UNIT * gasLimitTotal +
        100 // add 100 for safety

      const nonRevealOperations = tezosWrappedOperation.contents.filter((operation) => operation.kind !== 'reveal')
      const feePerOperation: number = Math.ceil(fee / nonRevealOperations.length)

      tezosWrappedOperation.contents.forEach((operation: TezosOperation) => {
        if ((operation as TezosTransactionOperation).fee && (operation as TezosRevealOperation).kind !== 'reveal') {
          ;(operation as TezosTransactionOperation).fee = feePerOperation.toString()
        }
      })
    }

    return tezosWrappedOperation
  }

  public async getDelegationInfo(delegatedAddress: string, fetchExtraInfo: boolean = true): Promise<DelegationInfo> {
    const { data } = await axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${delegatedAddress}`)
    let delegatedOpLevel: number | undefined
    let delegatedDate: Date | undefined

    // if the address is delegated, check since when
    if (data.delegate && fetchExtraInfo) {
      const recentTransactionData = await this.options.network.extras.indexerClient.getDelegationInfo(delegatedAddress)
      if (recentTransactionData) {
        delegatedDate = recentTransactionData.date
        delegatedOpLevel = recentTransactionData.level
      }
    }

    return {
      isDelegated: data.delegate ? true : false,
      value: data.delegate,
      delegatedDate,
      delegatedOpLevel
    }
  }

  public async bakerInfo(tzAddress: string | undefined): Promise<BakerInfo> {
    if (
      !tzAddress ||
      !(tzAddress.toLowerCase().startsWith('tz1') || tzAddress.toLowerCase().startsWith('tz2') || tzAddress.toLowerCase().startsWith('tz3'))
    ) {
      throw new ConditionViolationError(Domain.TEZOS, 'non tz-address supplied')
    }

    const results: (AxiosResponse | undefined)[] = await Promise.all([
      axios
        .get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/delegates/${tzAddress}/balance`)
        .catch((_error) => undefined),
      axios
        .get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/delegates/${tzAddress}/full_balance`)
        .catch((_error) => undefined),
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/delegates/${tzAddress}/delegated_balance`),
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/delegates/${tzAddress}/staking_balance`)
    ]).catch((error) => {
      throw new NetworkError(Domain.TEZOS, error as AxiosError)
    })

    const tzBalance: BigNumber = new BigNumber((results[0] ?? results[1])?.data)
    const delegatedBalance: BigNumber = new BigNumber(results[2]?.data)
    const stakingBalance: BigNumber = new BigNumber(results[3]?.data)

    // calculate the self bond of the baker
    const selfBond: BigNumber = stakingBalance.minus(delegatedBalance)

    // check what capacity is staked relatively to the self-bond
    const stakingCapacity: BigNumber = stakingBalance.div(selfBond.div(SELF_BOND_REQUIREMENT))

    const bakerInfo: BakerInfo = {
      balance: tzBalance,
      delegatedBalance,
      stakingBalance,
      selfBond,
      bakerCapacity: stakingBalance.div(stakingCapacity),
      bakerUsage: stakingCapacity
    }

    return bakerInfo
  }

  public async getDelegationRewardsForAddress(address: string): Promise<DelegationRewardInfo[]> {
    const status: DelegationInfo = await this.getDelegationInfo(address)

    if (!status.isDelegated || !status.value) {
      throw new ConditionViolationError(Domain.TEZOS, 'address not delegated')
    }

    return this.getDelegationRewards(status.value, address)
  }

  public async getDelegationRewards(bakerAddress: string, delegatorAddress?: string): Promise<DelegationRewardInfo[]> {
    // TODO: use the adapt logic for ithaca upgrade
    return []
    // const { data: frozenBalance }: AxiosResponse<TezosFrozenBalance[]> = await axios.get(
    //   `${this.options.network.rpcUrl}/chains/main/blocks/head/context/delegates/${bakerAddress}/frozen_balance_by_cycle`
    // )

    // const lastConfirmedCycle: number = frozenBalance[0].cycle - 1
    // const mostRecentCycle: number = frozenBalance[frozenBalance.length - 1].cycle

    // const { data: mostRecentBlock } = await axios.get(
    //   `${this.options.network.rpcUrl}/chains/main/blocks/${this.cycleToBlockLevel(mostRecentCycle)}`
    // )

    // const timestamp: Date = new Date(mostRecentBlock.header.timestamp)
    // const address = delegatorAddress ?? bakerAddress
    // const delegationInfo: DelegationRewardInfo[] = await Promise.all(
    //   frozenBalance.slice(0, 5).map(async (obj) => {
    //     const rewards = await this.calculateRewards(bakerAddress, obj.cycle, mostRecentCycle, false)
    //     let delegatedBalance = '0'
    //     let payoutAmount = '0'
    //     if (rewards.delegatedContracts.includes(address)) {
    //       const payout = await this.calculatePayout(address, rewards)
    //       delegatedBalance = payout.balance
    //       payoutAmount = payout.payout
    //     }

    //     return {
    //       cycle: obj.cycle,
    //       totalRewards: new BigNumber(obj.rewards),
    //       totalFees: new BigNumber(obj.fees),
    //       deposit: new BigNumber(obj.deposit ?? obj.deposits),
    //       delegatedBalance: new BigNumber(delegatedBalance),
    //       stakingBalance: new BigNumber(rewards.stakingBalance),
    //       reward: new BigNumber(payoutAmount),
    //       payout: new Date(timestamp.getTime() + this.timeIntervalBetweenCycles(lastConfirmedCycle, obj.cycle))
    //     }
    //   })
    // )

    // return delegationInfo
  }

  public async undelegate(publicKey: string): Promise<RawTezosTransaction> {
    return this.delegate(publicKey)
  }

  public async delegate(publicKey: string, delegate?: string | string[]): Promise<RawTezosTransaction> {
    let counter: BigNumber = new BigNumber(1)
    let branch: string = ''

    const operations: TezosOperation[] = []
    const tzAddress: string = await this.getAddressFromPublicKey(publicKey).then((address: TezosAddressResult) => address.address)

    const results: AxiosResponse[] = await Promise.all([
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${tzAddress}/counter`),
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head~2/hash`),
      axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/head/context/contracts/${tzAddress}/manager_key`)
    ]).catch((error) => {
      throw new NetworkError(Domain.TEZOS, error as AxiosError)
    })

    counter = new BigNumber(results[0].data).plus(1)
    branch = results[1].data

    const accountManager: string = results[2].data

    // check if we have revealed the address already
    if (!accountManager) {
      operations.push(await this.createRevealOperation(counter, publicKey, tzAddress))
      counter = counter.plus(1)
    }

    const balance: BigNumber = new BigNumber(await this.getBalanceOfAddresses([tzAddress]))

    const fee: BigNumber = new BigNumber(1420)

    if (balance.isLessThan(fee)) {
      throw new BalanceError(Domain.TEZOS, 'not enough balance')
    }

    const delegationOperation: TezosDelegationOperation = {
      kind: TezosOperationType.DELEGATION,
      source: tzAddress,
      fee: fee.toFixed(),
      counter: counter.toFixed(),
      gas_limit: '10000', // taken from eztz
      storage_limit: '0', // taken from eztz
      delegate: Array.isArray(delegate) ? delegate[0] : delegate
    }

    operations.push(delegationOperation)

    try {
      const tezosWrappedOperation: TezosWrappedOperation = {
        branch,
        contents: operations
      }

      const binaryTx: string = await this.forgeTezosOperation(tezosWrappedOperation)

      return { binaryTransaction: binaryTx }
    } catch (error: any) {
      throw new OperationFailedError(Domain.TEZOS, `Forging Tezos TX failed with ${JSON.stringify(error.message)}`)
    }
  }

  private getAmountUsedByPreviousOperations(operations: TezosOperation[]): BigNumber {
    let amountUsed: BigNumber = new BigNumber(0)

    operations.forEach((operation: TezosOperation) => {
      switch (operation.kind) {
        case TezosOperationType.REVEAL:
          const revealOperation = operation as TezosRevealOperation
          amountUsed = amountUsed.plus(revealOperation.fee)
          break
        case TezosOperationType.ORIGINATION:
          const originationOperation: TezosOriginationOperation = operation as TezosOriginationOperation
          amountUsed = amountUsed.plus(originationOperation.fee)
          amountUsed = amountUsed.plus(originationOperation.balance)
          break
        case TezosOperationType.DELEGATION:
          const delegationOperation = operation as TezosDelegationOperation
          amountUsed = amountUsed.plus(delegationOperation.fee)
          break
        case TezosOperationType.TRANSACTION:
          const spendOperation: TezosTransactionOperation = operation as TezosTransactionOperation
          amountUsed = amountUsed.plus(spendOperation.fee)
          amountUsed = amountUsed.plus(spendOperation.amount)
          break
        case TezosOperationType.ENDORSEMENT:
        case TezosOperationType.SEED_NONCE_REVELATION:
        case TezosOperationType.DOUBLE_ENDORSEMENT_EVIDENCE:
        case TezosOperationType.DOUBLE_BAKING_EVIDENCE:
        case TezosOperationType.ACTIVATE_ACCOUNT:
        case TezosOperationType.PROPOSALS:
        case TezosOperationType.BALLOT:
          break
        default:
          // Exhaustive switch
          assertNever(operation.kind)
          throw new UnsupportedError(Domain.TEZOS, `operation type not supported ${JSON.stringify(operation.kind)}`)
      }
    })

    return amountUsed
  }

  public async broadcastTransaction(rawTransaction: IAirGapSignedTransaction): Promise<string> {
    const payload: IAirGapSignedTransaction = rawTransaction

    const { data: injectionResponse }: { data: string } = await axios
      .post(`${this.options.network.rpcUrl}/injection/operation?chain=main`, JSON.stringify(payload), {
        headers: { 'content-type': 'application/json' }
      })
      .catch((error) => {
        throw new NetworkError(Domain.TEZOS, error as AxiosError)
      })

    // returns hash if successful
    return injectionResponse
  }

  protected checkAndRemovePrefixToHex(base58CheckEncodedPayload: string, tezosPrefix: Uint8Array): string {
    const prefixHex: string = Buffer.from(tezosPrefix).toString('hex')
    const payload: string = bs58check.decode(base58CheckEncodedPayload).toString('hex')
    if (payload.startsWith(prefixHex)) {
      return payload.substring(tezosPrefix.length * 2)
    } else {
      throw new ConditionViolationError(Domain.TEZOS, `payload did not match prefix: ${prefixHex}`)
    }
  }

  public async unforgeSignedTezosWrappedOperation(hexString: string): Promise<TezosWrappedOperation> {
    if (hexString.length <= 128) {
      throw new ConditionViolationError(Domain.TEZOS, 'Not a valid signed transaction')
    }

    return this.unforgeUnsignedTezosWrappedOperation(hexString.substring(0, hexString.length - 128))
  }

  public async unforgeUnsignedTezosWrappedOperation(hexString: string): Promise<TezosWrappedOperation> {
    return localForger.parse(hexString) as any
  }

  public async forgeTezosOperation(tezosWrappedOperation: TezosWrappedOperation): Promise<string> {
    return localForger.forge(tezosWrappedOperation as any)
  }

  public async createRevealOperation(
    counter: BigNumber,
    publicKey: string,
    address: string,
    fee: string = this.revealFee.toFixed()
  ): Promise<TezosRevealOperation> {
    const operation: TezosRevealOperation = {
      kind: TezosOperationType.REVEAL,
      fee,
      gas_limit: '10000', // taken from conseiljs
      storage_limit: '0', // taken from conseiljs
      counter: counter.toFixed(),
      public_key: bs58check.encode(Buffer.concat([TezosUtils.tezosPrefixes.edpk, Buffer.from(publicKey, 'hex')])),
      source: address
    }

    return operation
  }

  public async getTezosVotingInfo(blockHash: string): Promise<TezosVotingInfo[]> {
    const response: AxiosResponse = await axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/${blockHash}/votes/listings`)

    return response.data
  }

  public async fetchCurrentCycle(): Promise<number> {
    const headMetadata = await this.fetchBlockMetadata('head')
    const currentCycle: number = headMetadata.level_info.cycle

    return currentCycle
  }

  private static readonly FIRST_010_CYCLE: number = 388

  private static readonly BLOCKS_PER_CYCLE: { [key in TezosNetwork]: number[] } = {
    [TezosNetwork.MAINNET]: [4096, 8192],
    [TezosNetwork.GHOSTNET]: [4096]
  }

  private static readonly TIME_BETWEEN_BLOCKS: { [key in TezosNetwork]: number[] } = {
    [TezosNetwork.MAINNET]: [60, 30],
    [TezosNetwork.GHOSTNET]: [30]
  }

  public timeIntervalBetweenCycles(fromCycle: number, toCycle: number): number {
    const cycle1 = Math.min(fromCycle, toCycle)
    const cycle2 = Math.max(fromCycle, toCycle)
    const timeBetweenBlocks = TezosProtocol.TIME_BETWEEN_BLOCKS[this.options.network.extras.network]
    const blocksPerCycle = TezosProtocol.BLOCKS_PER_CYCLE[this.options.network.extras.network]
    if (this.options.network.extras.network === TezosNetwork.MAINNET && cycle2 > TezosProtocol.FIRST_010_CYCLE) {
      if (cycle1 < TezosProtocol.FIRST_010_CYCLE) {
        return (
          ((TezosProtocol.FIRST_010_CYCLE - cycle1) * blocksPerCycle[0] * timeBetweenBlocks[0] +
            (cycle2 - TezosProtocol.FIRST_010_CYCLE) * blocksPerCycle[1] * timeBetweenBlocks[1]) *
          1000
        )
      }
      return (cycle2 - cycle1) * blocksPerCycle[1] * timeBetweenBlocks[1] * 1000
    }
    return (cycle2 - cycle1) * blocksPerCycle[0] * timeBetweenBlocks[0] * 1000
  }

  public cycleToBlockLevel(cycle: number): number {
    const blocksPerCycle = TezosProtocol.BLOCKS_PER_CYCLE[this.options.network.extras.network]
    if (this.options.network.extras.network === TezosNetwork.MAINNET && cycle > TezosProtocol.FIRST_010_CYCLE) {
      return TezosProtocol.FIRST_010_CYCLE * blocksPerCycle[0] + (cycle - TezosProtocol.FIRST_010_CYCLE) * blocksPerCycle[1] + 1
    }
    return cycle * blocksPerCycle[0] + 1
  }

  public blockLevelToCycle(blockLevel: number): number {
    const blocksPerCycle = TezosProtocol.BLOCKS_PER_CYCLE[this.options.network.extras.network]
    if (this.options.network.extras.network === TezosNetwork.MAINNET) {
      const last009BlockLevel = TezosProtocol.FIRST_010_CYCLE * blocksPerCycle[0]
      if (blockLevel > last009BlockLevel) {
        const deltaLevels = blockLevel - last009BlockLevel
        let deltaCycles = Math.floor(deltaLevels / blocksPerCycle[1])
        if (deltaLevels % blocksPerCycle[1] === 0) {
          deltaCycles -= 1
        }
        return TezosProtocol.FIRST_010_CYCLE + deltaCycles
      }
    }
    let cycle = Math.floor(blockLevel / blocksPerCycle[0])
    if (blockLevel % blocksPerCycle[0] === 0) {
      cycle -= 1
    }
    return cycle
  }

  private async fetchBlockMetadata(block: number | 'head'): Promise<any> {
    const result = await axios.get(`${this.options.network.rpcUrl}/chains/main/blocks/${block}/metadata`)

    return result.data
  }

  public async signMessage(message: string, keypair: { privateKey: string }): Promise<string> {
    return this.cryptoClient.signMessage(message, keypair)
  }

  public async verifyMessage(message: string, signature: string, publicKey: string): Promise<boolean> {
    return this.cryptoClient.verifyMessage(message, signature, publicKey)
  }

  public async encryptAsymmetric(message: string, publicKey: string): Promise<string> {
    return this.cryptoClient.encryptAsymmetric(message, publicKey)
  }

  public async decryptAsymmetric(message: string, keypair: { publicKey: string; privateKey: string }): Promise<string> {
    return this.cryptoClient.decryptAsymmetric(message, keypair)
  }

  public async encryptAES(message: string, privateKey: string): Promise<string> {
    return this.cryptoClient.encryptAES(message, privateKey)
  }

  public async decryptAES(message: string, privateKey: string): Promise<string> {
    return this.cryptoClient.decryptAES(message, privateKey)
  }

  public async getTransactionStatuses(transactionHashes: string[]): Promise<AirGapTransactionStatus[]> {
    throw new Error('Method not implemented.')
  }
}

export interface TezosBakingRight {
  level: number
  delegate: string
  priority: number
}

export interface TezosBakingRewards {
  totalBakingRewards: string
  rewardsDetails: { level: number; amount: string; deposit: string; fees?: string }[]
}

export interface TezosEndorsingRewards {
  totalEndorsingRewards: string
  rewardsDetails: { level: number; amount: string; deposit: string }[]
}

export interface TezosEndorsingRight {
  level: number
  block_level?: number
  delegate: string
  number_of_slots: number
}

export interface TezosRewardsCalculations {
  calculateRewards(bakerAddress: string, cycle: number, breakDownRewards: boolean, currentCycleIn?: number): Promise<TezosRewards>
}

export interface TezosRewards {
  baker: string
  stakingBalance: string
  bakingRewards: string
  bakingDeposits: string
  endorsingDeposits: string
  endorsingRewards: string
  fees: string
  deposit: string
  totalRewards: string
  cycle: number
  snapshotBlockLevel: number
  delegatedContracts: string[]
  bakingRewardsDetails: { level: number; amount: string; deposit: string; fees?: string }[]
  endorsingRewardsDetails: { level: number; amount: string; deposit: string }[]
  endorsingRightsCount: number
}

export interface TezosBakerInfo {
  balance: string
  frozen_balance: string
  frozen_balance_by_cycle: TezosFrozenBalance[]
  staking_balance: string
  delegated_contracts: string[]
  delegated_balance: string
  deactivated: boolean
  grace_period: number
}

export interface TezosFrozenBalance {
  cycle: number
  deposit?: string
  deposits: string
  fees: string
  rewards: string
}

export interface TezosNodeConstants {
  proof_of_work_nonce_size: number
  nonce_length: number
  max_revelations_per_block: number
  max_operation_data_length: number
  max_proposals_per_delegate: number
  preserved_cycles: number
  blocks_per_cycle: number
  blocks_per_commitment: number
  blocks_per_roll_snapshot: number
  blocks_per_voting_period: number
  time_between_blocks: number[]
  endorsers_per_block: number
  hard_gas_limit_per_operation: string
  hard_gas_limit_per_block: string
  proof_of_work_threshold: number
  tokens_per_roll: string
  michelson_maximum_type_size: number
  seed_nonce_revelation_tip: string
  origination_size: number
  block_security_deposit: string
  endorsement_security_deposit: string
  cost_per_byte: string
  hard_storage_limit_per_operation: string
  test_chain_duration: string
  quorum_min: number
  quorum_max: number
  min_proposal_quorum: number
  initial_endorsers: number
  delay_per_missing_endorsement: string
}

export interface TezosNodeConstantsV1 extends TezosNodeConstants {
  block_reward: string
  endorsement_reward: string
}

export interface TezosNodeConstantsV2 extends TezosNodeConstants {
  baking_reward_per_endorsement: string[]
  endorsement_reward: string[]
}
