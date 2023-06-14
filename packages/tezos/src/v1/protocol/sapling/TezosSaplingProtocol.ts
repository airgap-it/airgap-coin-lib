import { assertNever, Domain } from '@airgap/coinlib-core'
import { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import {
  BalanceError,
  ConditionViolationError,
  NetworkError,
  PropertyUndefinedError,
  ProtocolErrorType,
  UnsupportedError
} from '@airgap/coinlib-core/errors'
import { flattenArray } from '@airgap/coinlib-core/utils/array'
import { encodeDerivative } from '@airgap/crypto'
import {
  AddressWithCursor,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeEstimation,
  KeyPair,
  newAmount,
  newPublicKey,
  newSecretKey,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  PublicKey,
  SecretKey,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'
import * as sapling from '@airgap/sapling-wasm'
import { randomBytes } from '@stablelib/random'

import { TezosSaplingAddressResult } from '../../../v0/protocol/types/sapling/TezosSaplingAddressResult'
import { TezosContract } from '../../contract/TezosContract'
import { TezosContractCall } from '../../contract/TezosContractCall'
import { TezosSaplingCryptoClient } from '../../crypto/TezosSaplingCryptoClient'
import { TezosAddress } from '../../data/TezosAddress'
import { TezosSaplingAddress } from '../../data/TezosSaplingAddress'
import { TezosSaplingInjectorClient } from '../../injector/TezosSaplingInjectorClient'
import { TezosSaplingNodeClient } from '../../node/TezosSaplingNodeClient'
import { TezosSaplingAddressCursor } from '../../types/address'
import { TezosSaplingCryptoConfiguration } from '../../types/crypto'
import { MichelsonAddress } from '../../types/michelson/primitives/MichelsonAddress'
import { TezosOperation } from '../../types/operations/kinds/TezosOperation'
import { TezosTransactionOperation, TezosTransactionParameters } from '../../types/operations/kinds/Transaction'
import { TezosOperationType } from '../../types/operations/TezosOperationType'
import { TezosWrappedOperation } from '../../types/operations/TezosWrappedOperation'
import { TezosSaplingProtocolNetwork, TezosSaplingProtocolOptions, TezosUnits } from '../../types/protocol'
import { TezosSaplingCiphertext } from '../../types/sapling/TezosSaplingCiphertext'
import { TezosSaplingExternalMethodProvider } from '../../types/sapling/TezosSaplingExternalMethodProvider'
import { TezosSaplingInput } from '../../types/sapling/TezosSaplingInput'
import { TezosSaplingOutput } from '../../types/sapling/TezosSaplingOutput'
import { TezosSaplingStateDiff } from '../../types/sapling/TezosSaplingStateDiff'
import { TezosSaplingStateTree } from '../../types/sapling/TezosSaplingStateTree'
import { TezosSaplingTransaction } from '../../types/sapling/TezosSaplingTransaction'
import {
  TezosSaplingSignedTransaction,
  TezosSaplingTransactionCursor,
  TezosSaplingUnsignedTransaction,
  TezosSignedTransaction,
  TezosUnsignedTransaction
} from '../../types/transaction'
import { convertPublicKey, convertSecretKey } from '../../utils/key'
import { encodeTzAddress, packMichelsonType } from '../../utils/pack'
import { TezosSaplingAccountant } from '../../utils/protocol/sapling/TezosSaplingAccountant'
import { TezosSaplingEncoder } from '../../utils/protocol/sapling/TezosSaplingEncoder'
import { TezosSaplingForger } from '../../utils/protocol/sapling/TezosSaplingForger'
import { TezosSaplingState } from '../../utils/protocol/sapling/TezosSaplingState'
import { isUnsignedSaplingTransaction } from '../../utils/transaction'
import { createTezosProtocol, TEZOS_UNITS, TezosProtocol } from '../TezosProtocol'

// Interface

export interface TezosSaplingProtocol<_Units extends string = string>
  extends AirGapProtocol<
    {
      AddressCursor: TezosSaplingAddressCursor
      AddressResult: AddressWithCursor<TezosSaplingAddressCursor>
      ProtocolNetwork: TezosSaplingProtocolNetwork
      CryptoConfiguration: TezosSaplingCryptoConfiguration
      Units: _Units
      FeeUnits: TezosUnits
      UnsignedTransaction: TezosSaplingUnsignedTransaction
      SignedTransaction: TezosSaplingSignedTransaction
      TransactionCursor: TezosSaplingTransactionCursor
    },
    'MultiAddressPublicKey',
    'ConfigurableContract',
    'ConfigurableTransactionInjector'
  > {
  isTezosSaplingProtocol: true

  initParameters(spendParams: Buffer, outputParams: Buffer): Promise<void>

  getAddressFromViewingKey(viewingKey: PublicKey, index: string): Promise<AddressWithCursor<TezosSaplingAddressCursor>>

  getDetailsFromTransaction(
    transaction: TezosSaplingSignedTransaction | TezosSaplingUnsignedTransaction | TezosSignedTransaction | TezosUnsignedTransaction,
    publicKey: PublicKey,
    knownViewingKeys?: string[]
  ): Promise<AirGapTransaction<_Units, TezosUnits>[]>

  prepareShieldTransaction(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosUnsignedTransaction>
  prepareSaplingTransaction(
    viewingKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits> & { dummyInputs?: number; dummyOutputs?: number }
  ): Promise<TezosSaplingUnsignedTransaction>
  prepareUnshieldTransaction(
    viewingKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosSaplingUnsignedTransaction>
  wrapSaplingTransactions(
    publicKey: PublicKey,
    transactions: string[] | string,
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosUnsignedTransaction>

  prepareContractCalls(transactions: string[]): Promise<TezosContractCall[]>
  parseParameters(parameters: TezosTransactionParameters): Promise<string[]>
}

// Implementation

export abstract class TezosSaplingProtocolImpl<_Units extends string> implements TezosSaplingProtocol<_Units> {
  public readonly isTezosSaplingProtocol: true = true

  protected readonly tezos: TezosProtocol

  protected readonly accountant: TezosSaplingAccountant<_Units>
  protected readonly encoder: TezosSaplingEncoder
  protected readonly forger: TezosSaplingForger
  protected readonly state: TezosSaplingState

  public readonly cryptoClient: TezosSaplingCryptoClient
  public nodeClient?: TezosSaplingNodeClient
  public contract?: TezosContract
  public injectorClient?: TezosSaplingInjectorClient

  protected readonly memoSize: number

  protected readonly externalProvider: TezosSaplingExternalMethodProvider | undefined

  protected readonly network: TezosSaplingProtocolNetwork

  protected constructor(options: TezosSaplingProtocolOptions<_Units>) {
    this.metadata = {
      ...options.metadata,
      fee: {
        ...(options.metadata.fee ?? {}),
        units: TEZOS_UNITS,
        mainUnit: 'tez'
      },
      account: {
        standardDerivationPath: options.metadata.account.standardDerivationPath,
        address: {
          isCaseSensitive: true,
          placeholder: 'zet1...',
          regex: '^(zet1[1-9A-Za-z]{65}|tz1[1-9A-Za-z]{33})$'
        }
      }
    }

    this.network = options.network

    this.memoSize = options.memoSize

    this.tezos = createTezosProtocol({ network: options.network })

    this.externalProvider = options.externalProvider
    this.cryptoClient = new TezosSaplingCryptoClient()
    this.state = new TezosSaplingState(options.merkleTreeHeight)
    this.encoder = new TezosSaplingEncoder()
    this.forger = new TezosSaplingForger(this.cryptoClient, this.state, this.encoder, this.externalProvider)
    this.accountant = new TezosSaplingAccountant(this.network, this.cryptoClient, this.encoder)

    this.nodeClient = this.network.contractAddress
      ? new TezosSaplingNodeClient(this.network.rpcUrl, this.network.contractAddress)
      : undefined

    this.contract = this.network.contractAddress ? new TezosContract(this.network.contractAddress, this.network) : undefined

    this.injectorClient =
      this.network.injectorUrl && this.network.contractAddress
        ? new TezosSaplingInjectorClient(this.network.injectorUrl, this.network.contractAddress)
        : undefined
  }

  // Common

  protected readonly metadata: ProtocolMetadata<_Units, TezosUnits>

  public async getMetadata(): Promise<ProtocolMetadata<_Units, TezosUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor<TezosSaplingAddressCursor>> {
    const address: TezosSaplingAddress = await TezosSaplingAddress.fromViewingKey(publicKey)

    return {
      address: address.asString(),
      cursor: {
        hasNext: address.diversifierIndex !== undefined,
        diversifierIndex: address.diversifierIndex
      }
    }
  }

  public async getInitialAddressesFromPublicKey(publicKey: PublicKey): Promise<AddressWithCursor<TezosSaplingAddressCursor>[]> {
    return [await this.getAddressFromPublicKey(publicKey)]
  }

  public async getNextAddressFromPublicKey(
    publicKey: PublicKey,
    cursor: TezosSaplingAddressCursor
  ): Promise<AddressWithCursor<TezosSaplingAddressCursor> | undefined> {
    if (!cursor.hasNext) {
      return undefined
    }

    const current: TezosSaplingAddress = await TezosSaplingAddress.fromViewingKey(publicKey, cursor.diversifierIndex)
    const next: TezosSaplingAddress = await TezosSaplingAddress.next(publicKey, current)

    return {
      address: next.asString(),
      cursor: {
        hasNext: next.diversifierIndex !== undefined,
        diversifierIndex: next.diversifierIndex
      }
    }
  }

  public async getContractAddress(): Promise<string | undefined> {
    return this.network.contractAddress
  }

  public abstract isContractValid(address: string): Promise<boolean>

  public async setContractAddress(address: string): Promise<void> {
    this.network.contractAddress = address
    this.contract = new TezosContract(address, this.network)
    this.nodeClient = new TezosSaplingNodeClient(this.network.rpcUrl, address)
    if (this.network.injectorUrl !== undefined) {
      this.injectorClient = new TezosSaplingInjectorClient(this.network.injectorUrl, address)
    }
  }

  public async getDetailsFromTransaction(
    transaction: TezosSaplingSignedTransaction | TezosSaplingUnsignedTransaction | TezosSignedTransaction | TezosUnsignedTransaction,
    publicKey: PublicKey,
    knownViewingKeys?: string[]
  ): Promise<AirGapTransaction<_Units, TezosUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedTransaction(transaction, knownViewingKeys)
      case 'unsigned':
        return this.getDetailsFromUnsignedTransaction(transaction, publicKey, knownViewingKeys)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.TEZOS, 'Unsupported transaction type.')
    }
  }

  private async getDetailsFromSignedTransaction(
    transaction: TezosSaplingSignedTransaction | TezosSignedTransaction,
    knownViewingKeys?: string[]
  ): Promise<AirGapTransaction<_Units, TezosUnits>[]> {
    const airGapTxs: AirGapTransaction<_Units, TezosUnits>[] = []
    const binary = transaction.binary

    const defaultDetails: AirGapTransaction<_Units, TezosUnits> = {
      from: ['Shielded Pool'],
      to: ['Shielded Pool'],
      isInbound: false,
      amount: newAmount(0, 'blockchain'),
      fee: newAmount(0, 'blockchain'),
      network: this.network
    }

    if (this.contract?.areValidParameters(binary)) {
      const partialDetails: Partial<AirGapTransaction<_Units, TezosUnits>>[] = await this.getPartialDetailsFromContractParameters(
        binary,
        knownViewingKeys
      )

      airGapTxs.push(
        ...partialDetails.map((partial: Partial<AirGapTransaction<_Units, TezosUnits>>) => ({
          ...defaultDetails,
          ...partial
        }))
      )
    } else {
      try {
        const wrappedOperation: TezosWrappedOperation = await this.tezos.unforgeOperation(binary, 'signed')

        airGapTxs.push(...(await this.getDetailsFromWrappedOperation(wrappedOperation, knownViewingKeys)))
      } catch {
        const partialDetails: Partial<AirGapTransaction<_Units, TezosUnits>>[] = await this.accountant.getTransactionsPartialDetails(
          [binary],
          knownViewingKeys
        )

        airGapTxs.push(
          ...partialDetails.map((partial: Partial<AirGapTransaction<_Units, TezosUnits>>) => ({
            ...defaultDetails,
            ...partial
          }))
        )
      }
    }

    return this.filterOutPaybacks(airGapTxs)
  }

  private async getDetailsFromUnsignedTransaction(
    transaction: TezosSaplingUnsignedTransaction | TezosUnsignedTransaction,
    viewingKey: PublicKey,
    knownViewingKeys?: string[]
  ): Promise<AirGapTransaction<_Units, TezosUnits>[]> {
    const airGapTxs: AirGapTransaction<_Units, TezosUnits>[] = []
    if (isUnsignedSaplingTransaction(transaction)) {
      const unshieldTarget = transaction.unshieldTarget.length > 0 ? transaction.unshieldTarget : undefined
      const from: TezosSaplingAddress = await this.getAddressFromPublicKey(viewingKey).then((address: TezosSaplingAddressResult) =>
        TezosSaplingAddress.fromValue(address.address, address.cursor.diversifierIndex)
      )

      const details: AirGapTransaction<_Units, TezosUnits>[] = this.accountant
        .getUnsignedTransactionDetails(from, transaction.ins, transaction.outs, unshieldTarget)
        .map(
          (details: AirGapTransaction<_Units, TezosUnits>): AirGapTransaction<_Units, TezosUnits> => ({
            ...details,
            extra: {
              ...(details.extra ?? {}),
              destination: transaction.contractAddress,
              chainId: transaction.chainId
            }
          })
        )

      airGapTxs.push(...details)
    } else {
      const wrappedOperation: TezosWrappedOperation = await this.tezos.unforgeOperation(transaction.binary, 'unsigned')
      airGapTxs.push(...(await this.getDetailsFromWrappedOperation(wrappedOperation, knownViewingKeys)))
    }

    return this.filterOutPaybacks(airGapTxs)
  }

  private async getDetailsFromWrappedOperation(
    operation: TezosWrappedOperation,
    knownViewingKeys: string[] = []
  ): Promise<AirGapTransaction<_Units, TezosUnits>[]> {
    type TezosContractOperation = TezosTransactionOperation & Required<Pick<TezosTransactionOperation, 'parameters'>>
    const contractOperations: TezosContractOperation[] = operation.contents.filter(
      (content: TezosOperation) =>
        content.kind === TezosOperationType.TRANSACTION && (content as TezosTransactionOperation).parameters !== undefined
    ) as TezosContractOperation[]

    const details: AirGapTransaction<_Units, TezosUnits>[][] = await Promise.all(
      contractOperations.map(async (operation: TezosContractOperation) => {
        const saplingDetails: Partial<AirGapTransaction<_Units, TezosUnits>>[] = await this.getPartialDetailsFromContractParameters(
          operation.parameters,
          knownViewingKeys
        )

        return saplingDetails.map((partials: Partial<AirGapTransaction<_Units, TezosUnits>>) => ({
          from: [operation.source],
          to: ['Shielded Pool'],
          isInbound: false,
          amount: newAmount(operation.amount, 'blockchain'),
          fee: newAmount(operation.fee, 'blockchain'),
          network: this.network,
          ...partials,
          transactionDetails: operation
        }))
      })
    )

    return flattenArray(details)
  }

  private async getPartialDetailsFromContractParameters(
    rawOrParsed: string | TezosTransactionParameters,
    knownViewingKeys: string[] = []
  ): Promise<Partial<AirGapTransaction<_Units, TezosUnits>>[]> {
    const parameters: TezosTransactionParameters =
      typeof rawOrParsed === 'string' ? (this.contract ? this.contract.parseParameters(rawOrParsed) : JSON.parse(rawOrParsed)) : rawOrParsed

    const txs: string[] = await this.parseParameters(parameters)

    return this.accountant.getTransactionsPartialDetails(txs, knownViewingKeys)
  }

  private filterOutPaybacks(airGapTxs: AirGapTransaction<_Units, TezosUnits>[]): AirGapTransaction<_Units, TezosUnits>[] {
    const filtered: AirGapTransaction<_Units, TezosUnits>[] = airGapTxs.filter((details: AirGapTransaction<_Units, TezosUnits>) => {
      if (details.from.length !== details.to.length) {
        return true
      }

      const fromSet: Set<string> = new Set(details.from)
      const toSet: Set<string> = new Set(details.to)

      return Array.from(fromSet).some((address: string) => !toSet.has(address))
    })

    return filtered.length > 0 ? filtered : airGapTxs
  }

  // Offline

  private readonly cryptoConfiguration: TezosSaplingCryptoConfiguration = {
    algorithm: 'sapling',
    secretType: 'miniSecretXor'
  }

  public async getCryptoConfiguration(): Promise<TezosSaplingCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    const zip32Node = encodeDerivative('zip32', derivative)

    return {
      secretKey: newSecretKey(zip32Node.secretKey, 'hex'),
      publicKey: newPublicKey(zip32Node.publicKey, 'hex')
    }
  }

  public async signTransactionWithSecretKey(
    transaction: TezosSaplingUnsignedTransaction,
    secretKey: SecretKey
  ): Promise<TezosSaplingSignedTransaction> {
    const hexSecretKey: SecretKey = convertSecretKey(secretKey, 'hex', 'saplingSpendingKey')
    const stateTree: TezosSaplingStateTree = await this.state.getStateTreeFromStateDiff(transaction.stateDiff)

    const boundData: string | undefined =
      transaction.unshieldTarget && transaction.unshieldTarget.length > 0
        ? this.createAddressBoundData(transaction.unshieldTarget)
        : undefined

    const forgedTransaction: TezosSaplingTransaction = await this.forger.forgeSaplingTransaction(
      transaction.ins,
      transaction.outs,
      stateTree,
      this.getAntiReplay(transaction.chainId, transaction.contractAddress),
      boundData,
      Buffer.from(hexSecretKey.value, 'hex')
    )

    return newSignedTransaction<TezosSaplingSignedTransaction>({
      binary: this.encoder.encodeTransaction(forgedTransaction).toString('hex')
    })
  }

  // Online

  public async getNetwork(): Promise<TezosSaplingProtocolNetwork> {
    return this.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: TezosSaplingTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<TezosSaplingTransactionCursor, _Units, TezosUnits>> {
    if (this.nodeClient === undefined) {
      return {
        transactions: [],
        cursor: {
          hasNext: false
        }
      }
    }

    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex', 'saplingViewingKey')

    const saplingStateDiff: TezosSaplingStateDiff = await this.nodeClient.getSaplingStateDiff()

    const incoming: TezosSaplingInput[] = []
    const outgoing: TezosSaplingInput[] = []

    let page: number = cursor?.page ?? 0
    let pageStart: number = page * limit
    let pageEnd: number = pageStart + limit

    let hasNext: boolean = pageStart < saplingStateDiff.commitments_and_ciphertexts.length

    while (incoming.length + outgoing.length < limit && hasNext) {
      const commitmentsAndCiphertexts: [string, TezosSaplingCiphertext, BigNumber][] = saplingStateDiff.commitments_and_ciphertexts
        .map(
          ([commitment, ciphertext]: [string, TezosSaplingCiphertext], index: number) =>
            [commitment, ciphertext, new BigNumber(index)] as [string, TezosSaplingCiphertext, BigNumber]
        )
        .reverse()
        .slice(pageStart, pageEnd)

      const inputs: [TezosSaplingInput[], TezosSaplingInput[]] = await Promise.all([
        this.accountant.getIncomingInputs(hexPublicKey.value, commitmentsAndCiphertexts),
        this.accountant.getOutgoingInputs(hexPublicKey.value, commitmentsAndCiphertexts)
      ])

      incoming.push(...inputs[0])
      outgoing.push(...inputs[1])

      page += 1
      pageStart += limit
      pageEnd += limit

      hasNext = pageStart < saplingStateDiff.commitments_and_ciphertexts.length
    }

    const airGapIncoming: AirGapTransaction<_Units, TezosUnits>[] = await Promise.all(
      incoming.map(async (input: TezosSaplingInput) => ({
        from: ['Shielded Pool'],
        to: [input.address],
        isInbound: true,
        amount: newAmount(input.value, 'blockchain'),
        fee: newAmount(0, 'blockchain'),
        network: this.network
      }))
    )

    const airGapOutgoing: AirGapTransaction<_Units, TezosUnits>[] = await Promise.all(
      outgoing.map(async (input: TezosSaplingInput) => ({
        from: [(await this.getAddressFromPublicKey(publicKey)).address],
        to: [input.address],
        isInbound: false,
        amount: newAmount(input.value, 'blockchain'),
        fee: newAmount(0, 'blockchain'),
        network: this.network
      }))
    )

    return {
      transactions: airGapIncoming.concat(airGapOutgoing),
      cursor: {
        hasNext,
        page: hasNext ? page + 1 : undefined
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<_Units>> {
    if (this.nodeClient === undefined) {
      return { total: newAmount(0, 'blockchain') }
    }

    const hexPublicKey: PublicKey = convertPublicKey(publicKey, 'hex', 'saplingViewingKey')
    const saplingStateDiff: TezosSaplingStateDiff = await this.nodeClient.getSaplingStateDiff()
    const unspends: TezosSaplingInput[] = await this.accountant.getUnspends(
      hexPublicKey.value,
      saplingStateDiff.commitments_and_ciphertexts,
      saplingStateDiff.nullifiers
    )

    const balance: BigNumber = unspends.reduce((sum: BigNumber, next: TezosSaplingInput) => sum.plus(next.value), new BigNumber(0))

    return { total: newAmount(balance, 'blockchain') }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    _to: string[],
    _configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<Amount<_Units>> {
    const balance: Balance<_Units> = await this.getBalanceOfPublicKey(publicKey)

    return balance.total
  }

  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<_Units>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<FeeEstimation<TezosUnits> | undefined> {
    return undefined
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosSaplingUnsignedTransaction> {
    if (details.length > 1) {
      throw new UnsupportedError(Domain.TEZOS, 'Multiple sapling transactions are not supported yet')
    }

    const recipient: string = details[0].to

    if (TezosAddress.isTzAddress(recipient)) {
      return this.prepareUnshieldTransaction(publicKey, details, configuration)
    } else if (TezosSaplingAddress.isZetAddress(recipient)) {
      return this.prepareSaplingTransaction(publicKey, details, configuration)
    }

    throw new ConditionViolationError(Domain.TEZOS, `Invalid recpient, expected a 'tz' or 'zet' address, got ${recipient}`)
  }

  public async broadcastTransaction(transaction: TezosSaplingSignedTransaction): Promise<string> {
    if (!this.injectorClient) {
      throw new PropertyUndefinedError(
        Domain.TEZOS,
        "Can't broadcast a sapling transaction, an injector service URL or contract address has not be set."
      )
    }

    try {
      const hash: string = await this.injectorClient.injectTransaction(transaction.binary)

      return hash
    } catch (error) {
      throw new NetworkError(Domain.TEZOS, error as AxiosError)
    }
  }

  public async getInjectorUrl(): Promise<string | undefined> {
    return this.network.injectorUrl
  }

  public async setInjectorUrl(url: string): Promise<void> {
    this.network.injectorUrl = url

    if (this.network.contractAddress !== undefined) {
      this.injectorClient = new TezosSaplingInjectorClient(url, this.network.contractAddress)
    }
  }

  // Custom

  public abstract prepareContractCalls(transactions: string[]): Promise<TezosContractCall[]>
  public abstract parseParameters(parameters: TezosTransactionParameters): Promise<string[]>

  public async initParameters(spendParams: Buffer, outputParams: Buffer): Promise<void> {
    const externalInitParameters = this.externalProvider ? this.externalProvider.initParameters?.bind(this.externalProvider) : undefined

    if (externalInitParameters !== undefined) {
      await externalInitParameters(spendParams, outputParams)
    } else {
      await sapling.initParameters(spendParams, outputParams)
    }
  }

  public async getAddressFromViewingKey(viewingKey: PublicKey, index: string): Promise<AddressWithCursor<TezosSaplingAddressCursor>> {
    const address: TezosSaplingAddress = await TezosSaplingAddress.fromViewingKey(viewingKey, index)

    return {
      address: address.asString(),
      cursor: {
        hasNext: address.diversifierIndex !== undefined,
        diversifierIndex: address.diversifierIndex
      }
    }
  }

  public async prepareShieldTransaction(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosUnsignedTransaction> {
    if (details.length > 1) {
      throw new UnsupportedError(Domain.TEZOS, 'Multiple sapling transactions are not supported yet')
    }

    const recipient: string = details[0].to
    const value: string = newAmount(details[0].amount).blockchain(this.metadata.units).value

    const encodedTransaction: string = await this.mint(recipient, value)

    return this.wrapSaplingTransactions(publicKey, [encodedTransaction], configuration)
  }

  public async prepareSaplingTransaction(
    viewingKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<TezosUnits> & { dummyInputs?: number; dummyOutputs?: number }
  ): Promise<TezosSaplingUnsignedTransaction> {
    if (details.length > 1) {
      throw new UnsupportedError(Domain.TEZOS, 'Multiple sapling transactions are not supported yet')
    }

    if (this.nodeClient === undefined || this.network.contractAddress === undefined) {
      throw new PropertyUndefinedError(Domain.TEZOS, 'Contract address not set.')
    }

    const recipient: string = details[0].to
    const value: string = newAmount(details[0].amount).blockchain(this.metadata.units).value

    if (!TezosSaplingAddress.isZetAddress(recipient)) {
      throw new ConditionViolationError(Domain.TEZOS, `Invalid recpient, expected a 'zet' address, got ${recipient}`)
    }

    const dummyInputsAmount: number = Math.max(new BigNumber(configuration?.dummyInputs ?? 0).toNumber(), 0)
    const dummyOutputsAmount: number = Math.max(new BigNumber(configuration?.dummyOutputs ?? 0).toNumber(), 0)

    const [stateDiff, chainId]: [TezosSaplingStateDiff, string] = await Promise.all([
      this.nodeClient.getSaplingStateDiff(),
      this.nodeClient.getChainId()
    ])

    const hexViewingKey: PublicKey = convertPublicKey(viewingKey, 'hex', 'saplingViewingKey')
    const [inputs, toSpend]: [TezosSaplingInput[], BigNumber] = await this.chooseInputs(
      hexViewingKey.value,
      stateDiff.commitments_and_ciphertexts,
      stateDiff.nullifiers,
      value
    )

    const address: TezosSaplingAddress = await this.getAddressFromPublicKey(viewingKey).then((address: TezosSaplingAddressResult) =>
      TezosSaplingAddress.fromValue(address.address, address.cursor.diversifierIndex)
    )

    const paymentOutput: TezosSaplingOutput = this.createPaymentOutput(await TezosSaplingAddress.fromValue(recipient), value)
    const paybackOutput: TezosSaplingOutput | undefined = this.createPaybackOutput(address, toSpend, value)

    const [dummyInputs, dummyOutputs]: [TezosSaplingInput[], TezosSaplingOutput[]] = await Promise.all([
      Promise.all(Array.from({ length: dummyInputsAmount }, (_v, _k) => this.createDummyInput(address))),
      Promise.all(Array.from({ length: dummyOutputsAmount }, (_v, _k) => this.createDummyOutput()))
    ])

    return newUnsignedTransaction<TezosSaplingUnsignedTransaction>({
      ins: inputs.concat(dummyInputs),
      outs: [paymentOutput, paybackOutput, ...dummyOutputs].filter((output) => output !== undefined) as TezosSaplingOutput[],
      contractAddress: this.network.contractAddress,
      chainId,
      stateDiff,
      unshieldTarget: ''
    })
  }

  public async prepareUnshieldTransaction(
    viewingKey: PublicKey,
    details: TransactionDetails<_Units>[],
    _configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosSaplingUnsignedTransaction> {
    if (details.length > 1) {
      throw new UnsupportedError(Domain.TEZOS, 'Multiple sapling transactions are not supported yet')
    }

    const recipient: string = details[0].to
    const value: string = newAmount(details[0].amount).blockchain(this.metadata.units).value

    const burnTransaction: TezosSaplingUnsignedTransaction = await this.burn(viewingKey, value)

    return {
      ...burnTransaction,
      unshieldTarget: recipient
    }
  }

  public async wrapSaplingTransactions(
    publicKey: PublicKey,
    transactions: string | string[],
    configuration?: TransactionFullConfiguration<TezosUnits>
  ): Promise<TezosUnsignedTransaction> {
    if (this.contract === undefined) {
      throw new PropertyUndefinedError(Domain.TEZOS, 'Contract address not set.')
    }

    const tezosMetadata = await this.tezos.getMetadata()
    const fee = configuration?.fee ? newAmount(configuration.fee).blockchain(tezosMetadata.units).value : '0'
    const overrideFees = configuration?.fee === undefined

    let operations: TezosOperation[] = []
    if (typeof transactions === 'string' && this.contract.areValidParameters(transactions)) {
      const parameters = this.contract.parseParameters(transactions)
      operations = [this.prepareTezosOperation(parameters, fee) as TezosOperation]
    } else {
      const normalizedTransactions = Array.isArray(transactions) ? transactions : [transactions]
      const contractCalls: TezosContractCall[] = await this.prepareContractCalls(normalizedTransactions)
      operations = contractCalls.map(
        (contractCall: TezosContractCall) =>
          this.prepareTezosOperation(contractCall.toJSON(), fee, contractCall.amount?.toString()) as TezosOperation
      )
    }

    try {
      const tezosWrappedOperation: TezosWrappedOperation = await this.tezos.prepareOperations(publicKey, operations, overrideFees)
      const binaryTx: string = await this.tezos.forgeOperation(tezosWrappedOperation)

      return newUnsignedTransaction<TezosUnsignedTransaction>({ binary: binaryTx })
    } catch (error: any) {
      console.error(error)
      if (error.code !== undefined && error.code === ProtocolErrorType.TRANSACTION_FAILED) {
        const rpcErrors = error.data as { id: string; kind: string; amount?: string; balance?: string; contract?: string }[]
        const cannotPayStorageFee = rpcErrors.find((error) => error.id.endsWith('.contract.cannot_pay_storage_fee'))
        if (cannotPayStorageFee) {
          throw new BalanceError(Domain.TEZOS, 'Balance too low, cannot pay for storage fee')
        }
        const balanceTooLowError = rpcErrors.find((error) => error.id.endsWith('.contract.balance_too_low'))
        if (balanceTooLowError) {
          throw new BalanceError(Domain.TEZOS, 'Balance too low')
        }
      }
      throw error
    }
  }

  private async mint(recipient: string, value: string): Promise<string> {
    if (this.nodeClient === undefined || this.network.contractAddress === undefined) {
      throw new PropertyUndefinedError(Domain.TEZOS, 'Contract address not set.')
    }

    if (!TezosSaplingAddress.isZetAddress(recipient)) {
      return Promise.reject(`Invalid recipient, expected a 'zet' address, got ${recipient}`)
    }

    const [saplingStateDiff, chainId]: [TezosSaplingStateDiff, string] = await Promise.all([
      this.nodeClient.getSaplingStateDiff(),
      this.nodeClient.getChainId()
    ])

    const output: TezosSaplingOutput = {
      address: (await TezosSaplingAddress.fromValue(recipient)).asString(),
      value,
      memo: Buffer.alloc(this.memoSize).toString('hex'),
      browsable: true
    }

    const stateTree: TezosSaplingStateTree = await this.state.getStateTreeFromStateDiff(saplingStateDiff, true)

    const forgedTransaction: TezosSaplingTransaction = await this.forger.forgeSaplingTransaction(
      [],
      [output],
      stateTree,
      this.getAntiReplay(chainId, this.network.contractAddress)
    )

    return this.encoder.encodeTransaction(forgedTransaction).toString('hex')
  }

  private async burn(viewingKey: PublicKey, value: string): Promise<TezosSaplingUnsignedTransaction> {
    if (this.nodeClient === undefined || this.network.contractAddress === undefined) {
      throw new PropertyUndefinedError(Domain.TEZOS, 'Contract address not set.')
    }

    const [stateDiff, chainId]: [TezosSaplingStateDiff, string] = await Promise.all([
      this.nodeClient.getSaplingStateDiff(),
      this.nodeClient.getChainId()
    ])

    const hexViewingKey: PublicKey = convertPublicKey(viewingKey, 'hex', 'saplingViewingKey')
    const [inputs, toSpend]: [TezosSaplingInput[], BigNumber] = await this.chooseInputs(
      hexViewingKey.value,
      stateDiff.commitments_and_ciphertexts,
      stateDiff.nullifiers,
      value
    )

    const paybackOutput: TezosSaplingOutput = {
      address: (await this.getAddressFromPublicKey(viewingKey)).address,
      value: toSpend.minus(value).toString(),
      memo: Buffer.alloc(this.memoSize).toString('hex'),
      browsable: true
    }

    return newUnsignedTransaction<TezosSaplingUnsignedTransaction>({
      ins: inputs,
      outs: [paybackOutput],
      contractAddress: this.network.contractAddress,
      chainId,
      stateDiff,
      unshieldTarget: ''
    })
  }

  private async chooseInputs(
    viewingKey: Buffer | string,
    commitmentsWithCiphertext: [string, TezosSaplingCiphertext][],
    nullifiers: string[],
    value: string | number | BigNumber
  ): Promise<[TezosSaplingInput[], BigNumber]> {
    const unspends: TezosSaplingInput[] = await this.accountant.getUnspends(viewingKey, commitmentsWithCiphertext, nullifiers)
    const balance: BigNumber = this.accountant.sumNotes(unspends)

    if (balance.lt(value)) {
      return Promise.reject('Not enough balance')
    }

    const chosenUnspends: TezosSaplingInput[] = []
    let toSpend: BigNumber = new BigNumber(0)

    for (const unspend of unspends) {
      if (toSpend.gte(value)) {
        break
      }

      toSpend = toSpend.plus(unspend.value)
      chosenUnspends.push(unspend)
    }

    return [chosenUnspends, toSpend]
  }

  private createPaymentOutput(
    address: TezosSaplingAddress,
    value: BigNumber | number | string,
    memo: Buffer = Buffer.alloc(this.memoSize)
  ): TezosSaplingOutput {
    return {
      address: address.asString(),
      value: new BigNumber(value).toString(),
      memo: memo.toString('hex'),
      browsable: true
    }
  }

  private createPaybackOutput(
    address: TezosSaplingAddress,
    toSpend: BigNumber,
    value: BigNumber | number | string,
    memo: Buffer = Buffer.alloc(this.memoSize)
  ): TezosSaplingOutput | undefined {
    const paybackValue: BigNumber = toSpend.minus(value)

    return paybackValue.gt(0)
      ? {
          address: address.asString(),
          value: paybackValue.toString(),
          memo: memo.toString('hex'),
          browsable: true
        }
      : undefined
  }

  private async createDummyInput(address: TezosSaplingAddress): Promise<TezosSaplingInput> {
    const rcm: Buffer = await sapling.randR()

    return {
      rcm: rcm.toString('hex'),
      pos: '0',
      value: '0',
      address: address.asString()
    }
  }

  private async createDummyOutput(): Promise<TezosSaplingOutput> {
    const address: TezosSaplingAddressResult = await this.getDummyAddress()
    const memo: Uint8Array = randomBytes(this.memoSize)

    return {
      address: address.address,
      value: '0',
      memo: Buffer.from(memo).toString('hex'),
      browsable: false
    }
  }

  private async getDummyAddress(): Promise<TezosSaplingAddressResult> {
    const seed: Uint8Array = randomBytes(32)
    const xfvk: Buffer = await sapling.getExtendedFullViewingKey(seed, this.metadata.account.standardDerivationPath)
    const publicKey: PublicKey = newPublicKey(xfvk.toString('hex'), 'hex')

    return this.getAddressFromPublicKey(publicKey)
  }

  private createAddressBoundData(address: string): string {
    const michelson: MichelsonAddress = MichelsonAddress.from(encodeTzAddress(address))

    return packMichelsonType(michelson)
  }

  private getAntiReplay(chainId: string, contractAddress: string): string {
    return contractAddress + chainId
  }

  private prepareTezosOperation(
    parameters: TezosTransactionParameters,
    fee: string,
    amount: string = '0'
  ): Partial<TezosTransactionOperation> {
    return {
      kind: TezosOperationType.TRANSACTION,
      fee,
      amount,
      destination: this.network.contractAddress,
      parameters
    }
  }
}
