import { assertNever, DelegatorAction, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { BalanceError, ConditionViolationError, NetworkError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { flattenArray } from '@airgap/coinlib-core/utils/array'
import { assertFields } from '@airgap/coinlib-core/utils/assert'
import { encodeDerivative } from '@airgap/crypto'
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
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolAccountMetadata,
  ProtocolMetadata,
  ProtocolTransactionMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'
import { AirGapDelegateProtocol } from '@airgap/module-kit/internal'

import { ICPCryptoConfiguration } from '../types/crypto'
import {
  ICPDelegateeDetails,
  ICPDelegationDetails,
  ICPDelegatorDetails,
  ICPStakingActionType,
  KnownNeuron,
  Neuron,
  NeuronInfo
} from '../types/governance'
import { ICPProtocolNetwork, ICPProtocolOptions, ICPUnits } from '../types/protocol'
import {
  ICP_CANISTER_TYPE_PER_ACTION,
  ICP_REQUEST_TYPE_PER_ACTION,
  ICPActionType,
  ICPCanisterType,
  ICPSignedTransaction,
  ICPTransaction,
  ICPTransactionCursor,
  ICPUnsignedTransaction
} from '../types/transaction'
import { AccountIdentifier } from '../utils/account'
import * as Cbor from '../utils/cbor'
import { QueryResponse, QueryResponseStatus } from '../utils/http'
import * as IDL from '../utils/idl'
import { Principal } from '../utils/principal'

import {
  getDetailsFromSignedAutoStakeMaturity,
  getDetailsFromSignedDisburse,
  getDetailsFromSignedFollowNeuron,
  getDetailsFromSignedGetNeuronInfo,
  getDetailsFromSignedIncreaseDissolveDelay,
  getDetailsFromSignedStartDissolving,
  getDetailsFromSignedStopDissolving,
  getDetailsFromSignedTransferToSubaccount,
  getDetailsFromSignedClaimGovernance,
  getDetailsFromUnsignedAutoStakeMaturity,
  getDetailsFromUnsignedClaimGovernance,
  getDetailsFromUnsignedDisburse,
  getDetailsFromUnsignedFollowNeuron,
  getDetailsFromUnsignedGetNeuronInfo,
  getDetailsFromUnsignedIncreaseDissolveDelay,
  getDetailsFromUnsignedStartDissolving,
  getDetailsFromUnsignedStopDissolving,
  getDetailsFromUnsignedTransferToSubaccount,
  prepareAutoStakeMaturity,
  prepareClaimOrRefreshNeuron,
  prepareDisburse,
  prepareFollowNeuron,
  prepareGetNeuronInfo,
  prepareIncreaseDissolveDelay,
  prepareStartDissolving,
  prepareStopDissolving,
  prepareTransferToSubaccount,
  signAutoStakeMaturity,
  signClaimGovernance,
  signDisburse,
  signFollowNeuron,
  signGetNeuronInfo,
  signIncreaseDissolveDelay,
  signStartDissolving,
  signStopDissolving,
  signTransferToSubaccount
} from './ICPGovernance'
import {
  broadcastTransaction,
  createUnsignedTransaction,
  getAddressFromPublicKey,
  getBalanceFromAddress,
  getDetailsFromSignedTransactionTransfer,
  getDetailsFromUnsignedTransactionTransfer,
  getFixedSubaccountFromPublicKey,
  getKeyPairFromExtendedSecretKey,
  getNeuronInfo,
  getNeuronInfoBySubAccount,
  listKnownNeurons,
  signTransactionTransfer
} from './ICPImplementation'

// TODO: Refactor this module, the ICP token implements now the ICRC-1 standard and this protocol should extend the ICRC1Protocol interface

// Interface

export interface ICPProtocol
  extends AirGapProtocol<
      {
        AddressResult: Address
        ProtocolNetwork: ICPProtocolNetwork
        CryptoConfiguration: ICPCryptoConfiguration
        SignedTransaction: ICPSignedTransaction
        TransactionCursor: ICPTransactionCursor
        Units: ICPUnits
        FeeEstimation: Amount<ICPUnits>
        UnsignedTransaction: ICPUnsignedTransaction
      },
      'FetchDataForAddress'
    >,
    AirGapDelegateProtocol {
  getDelegateeDetails(address: Address, data?: any): Promise<ICPDelegateeDetails>
  getDelegatorDetailsFromPublicKey(publicKey: PublicKey, data?: any): Promise<ICPDelegatorDetails>
  getDelegatorDetailsFromAddress(address: Address, data?: any): Promise<ICPDelegatorDetails>
  getDelegationDetailsFromPublicKey(publicKey: PublicKey, delegatees: Address[], data?: any): Promise<ICPDelegationDetails>
  getDelegationDetailsFromAddress(address: Address, delegatees: Address[], data?: any): Promise<ICPDelegationDetails>

  sendQuery(transaction: ICPSignedTransaction): Promise<any[]>

  getMaxStakingAmount(publicKey: PublicKey): Promise<Amount<ICPUnits>>

  getKnownNeurons(): Promise<KnownNeuron[]>
}

// Implementation

export const ICP_DERIVATION_PATH: string = `m/44'/223'/0'/0/0`
export const ICP_ACCOUNT_METADATA: ProtocolAccountMetadata = {
  standardDerivationPath: ICP_DERIVATION_PATH,
  address: {
    isCaseSensitive: true,
    placeholder: '',
    regex: '^[a-f0-9]{64}$'
  }
}

export function ICP_TRANSACTION_METADATA<_Units extends string = ICPUnits>(): ProtocolTransactionMetadata<_Units> {
  return {
    arbitraryData: {
      inner: { name: 'payload' }
    }
  }
}

export class ICPProtocolImpl implements ICPProtocol {
  private readonly options: ICPProtocolOptions
  private readonly canisterId: Record<ICPCanisterType, string>

  public constructor(options: RecursivePartial<ICPProtocolOptions> = {}) {
    this.options = createICPProtocolOptions(options.network)
    this.canisterId = {
      ledger: this.options.network.ledgerCanisterId,
      governance: this.options.network.governanceCanisterId
    }
  }

  // Common
  private readonly units: ProtocolUnitsMetadata<ICPUnits> = {
    ICP: {
      symbol: { value: 'ICP', market: 'icp' },
      decimals: 8
    }
  }

  private readonly feeDefaults: FeeDefaults<ICPUnits> = {
    low: newAmount(0.0001, 'ICP'),
    medium: newAmount(0.0001, 'ICP'),
    high: newAmount(0.0001, 'ICP')
  }

  private readonly metadata: ProtocolMetadata<ICPUnits> = {
    identifier: MainProtocolSymbols.ICP,
    name: 'Internet Computer Protocol',

    units: this.units,
    mainUnit: 'ICP',

    fee: {
      defaults: this.feeDefaults
    },

    account: ICP_ACCOUNT_METADATA,
    transaction: ICP_TRANSACTION_METADATA()
  }

  public async getMetadata(): Promise<ProtocolMetadata<ICPUnits>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return getAddressFromPublicKey(publicKey.value)
  }

  public async getDetailsFromTransaction(
    transaction: ICPSignedTransaction | ICPUnsignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<ICPUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedTransaction(transaction, publicKey)
      case 'unsigned':
        return this.getDetailsFromUnsignedTransaction(transaction, publicKey)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.ICP, 'Unsupported transaction type.')
    }
  }

  private getDetailsFromSignedTransaction(transaction: ICPSignedTransaction, publicKey: PublicKey): AirGapTransaction<ICPUnits>[] {
    const transactions: AirGapTransaction<ICPUnits>[][] = transaction.transactions.map(({ actionType, encoded }) => {
      switch (actionType) {
        case ICPActionType.TRANSFER:
          return getDetailsFromSignedTransactionTransfer(encoded, publicKey.value, this.options.network)
        case ICPActionType.GET_NEURON_INFO:
          return getDetailsFromSignedGetNeuronInfo(encoded, publicKey.value, this.options.network)
        case ICPActionType.TRANSFER_TO_SUBACCOUNT:
          return getDetailsFromSignedTransferToSubaccount(encoded, publicKey.value, this.options.network)
        case ICPActionType.CLAIM_GOVERNANCE:
          return getDetailsFromSignedClaimGovernance(encoded, publicKey.value, this.options.network)
        case ICPActionType.FOLLOW_NEURON:
          return getDetailsFromSignedFollowNeuron(encoded, publicKey.value, this.options.network)
        case ICPActionType.DISBURSE:
          return getDetailsFromSignedDisburse(encoded, publicKey.value, this.options.network)
        case ICPActionType.INCREASE_DISSOLVE_DELAY:
          return getDetailsFromSignedIncreaseDissolveDelay(encoded, publicKey.value, this.options.network)
        case ICPActionType.START_DISSOLVING:
          return getDetailsFromSignedStartDissolving(encoded, publicKey.value, this.options.network)
        case ICPActionType.STOP_DISSOLVING:
          return getDetailsFromSignedStopDissolving(encoded, publicKey.value, this.options.network)
        case ICPActionType.AUTO_STAKE_MATURITY:
          return getDetailsFromSignedAutoStakeMaturity(encoded, publicKey.value, this.options.network)
        default:
          assertNever(actionType)
          throw new UnsupportedError(Domain.ICP, 'Unsupported ICP action type')
      }
    })

    return flattenArray(transactions)
  }

  private getDetailsFromUnsignedTransaction(transaction: ICPUnsignedTransaction, publicKey: PublicKey): AirGapTransaction<ICPUnits>[] {
    const transactions: AirGapTransaction<ICPUnits>[][] = transaction.transactions.map(({ actionType, encoded }) => {
      switch (actionType) {
        case ICPActionType.TRANSFER:
          return getDetailsFromUnsignedTransactionTransfer(encoded, publicKey.value, this.options.network)
        case ICPActionType.GET_NEURON_INFO:
          return getDetailsFromUnsignedGetNeuronInfo(publicKey.value, this.options.network)
        case ICPActionType.TRANSFER_TO_SUBACCOUNT:
          return getDetailsFromUnsignedTransferToSubaccount(encoded, publicKey.value, this.options.network)
        case ICPActionType.CLAIM_GOVERNANCE:
          return getDetailsFromUnsignedClaimGovernance(encoded, publicKey.value, this.options.network)
        case ICPActionType.DISBURSE:
          return getDetailsFromUnsignedDisburse(encoded, publicKey.value, this.options.network)
        case ICPActionType.INCREASE_DISSOLVE_DELAY:
          return getDetailsFromUnsignedIncreaseDissolveDelay(encoded, publicKey.value, this.options.network)
        case ICPActionType.START_DISSOLVING:
          return getDetailsFromUnsignedStartDissolving(encoded, publicKey.value, this.options.network)
        case ICPActionType.STOP_DISSOLVING:
          return getDetailsFromUnsignedStopDissolving(encoded, publicKey.value, this.options.network)
        case ICPActionType.FOLLOW_NEURON:
          return getDetailsFromUnsignedFollowNeuron(encoded, publicKey.value, this.options.network)
        case ICPActionType.AUTO_STAKE_MATURITY:
          return getDetailsFromUnsignedAutoStakeMaturity(encoded, publicKey.value, this.options.network)
        default:
          assertNever(actionType)
          throw new UnsupportedError(Domain.ICP, 'Unsupported ICP action type')
      }
    })

    return flattenArray(transactions)
  }

  // Offline

  private readonly cryptoConfiguration: ICPCryptoConfiguration = {
    algorithm: 'secp256k1'
  }

  public async getCryptoConfiguration(): Promise<ICPCryptoConfiguration> {
    return this.cryptoConfiguration
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    const bip32Node = encodeDerivative('bip32', derivative)
    const { publicKey, privateKey } = getKeyPairFromExtendedSecretKey(bip32Node.secretKey)

    return {
      secretKey: newSecretKey(privateKey, 'hex'),
      publicKey: newPublicKey(publicKey, 'hex')
    }
  }

  public async signTransactionWithSecretKey(transaction: ICPUnsignedTransaction, secretKey: SecretKey): Promise<ICPSignedTransaction> {
    if (secretKey.format !== 'hex') {
      throw new ConditionViolationError(Domain.ICP, 'Secret key is of an unexpected format.')
    }

    const transactions: ICPTransaction[] = await Promise.all(
      transaction.transactions.map(async ({ encoded, actionType }) => {
        switch (actionType) {
          case ICPActionType.TRANSFER:
            return {
              actionType,
              encoded: await signTransactionTransfer(encoded, secretKey.value, this.options.network.ledgerCanisterId)
            }
          case ICPActionType.GET_NEURON_INFO:
            return {
              actionType,
              encoded: await signGetNeuronInfo(encoded, secretKey.value, this.options.network.governanceCanisterId)
            }
          case ICPActionType.TRANSFER_TO_SUBACCOUNT:
            return {
              actionType,
              encoded: await signTransferToSubaccount(encoded, secretKey.value, this.options.network.ledgerCanisterId)
            }
          case ICPActionType.CLAIM_GOVERNANCE:
            return {
              actionType,
              encoded: await signClaimGovernance(encoded, secretKey.value, this.options.network.governanceCanisterId)
            }
          case ICPActionType.DISBURSE:
            return {
              actionType,
              encoded: await signDisburse(encoded, secretKey.value, this.options.network.governanceCanisterId)
            }
          case ICPActionType.INCREASE_DISSOLVE_DELAY:
            return {
              actionType,
              encoded: await signIncreaseDissolveDelay(encoded, secretKey.value, this.options.network.governanceCanisterId)
            }
          case ICPActionType.START_DISSOLVING:
            return {
              actionType,
              encoded: await signStartDissolving(encoded, secretKey.value, this.options.network.governanceCanisterId)
            }
          case ICPActionType.STOP_DISSOLVING:
            return {
              actionType,
              encoded: await signStopDissolving(encoded, secretKey.value, this.options.network.governanceCanisterId)
            }
          case ICPActionType.FOLLOW_NEURON:
            return {
              actionType,
              encoded: await signFollowNeuron(encoded, secretKey.value, this.options.network.governanceCanisterId)
            }
          case ICPActionType.AUTO_STAKE_MATURITY:
            return {
              actionType,
              encoded: await signAutoStakeMaturity(encoded, secretKey.value, this.options.network.governanceCanisterId)
            }
          default:
            assertNever(actionType)
            throw new UnsupportedError(Domain.ICP, `ICP action type ${actionType} is not supported.`)
        }
      })
    )

    return newSignedTransaction<ICPSignedTransaction>({ transactions })
  }

  // Online
  public async getNetwork(): Promise<ICPProtocolNetwork> {
    return this.options.network
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: ICPTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<ICPTransactionCursor, ICPUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)
    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: ICPTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<ICPTransactionCursor, ICPUnits>> {
    const endpoint = cursor === undefined ? `/accounts/${address}/transactions?limit=${limit}&offset=0` : cursor.next
    const url = endpoint !== undefined ? `${this.options.network.blockExplorerApi}${endpoint}` : undefined
    const response = url !== undefined ? await axios.get(url) : undefined

    const nodeTransactions = response?.data?.blocks || []

    const tokens = endpoint.split('=')
    const offset = parseInt(tokens[tokens.length - 1])
    tokens[tokens.length - 1] = (offset + limit).toString()
    const next = tokens.join('=')

    const transactions: AirGapTransaction<ICPUnits>[] = nodeTransactions.map((obj) => {
      return {
        from: [obj.from_account_identifier],
        to: [obj.to_account_identifier],
        isInbound: address === obj.to_account_identifier,
        amount: newAmount(obj.amount, 'blockchain'),
        fee: newAmount(obj.fee, 'blockchain'),

        network: this.options.network,

        timestamp: obj.created_at,
        status: {
          type: obj.transfer_type,
          hash: obj.transaction_hash,
          block: obj.block_height
        }
      }
    })

    return {
      transactions,
      cursor: {
        hasNext: next !== undefined,
        next
      }
    }
  }

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<ICPUnits>> {
    const address = getAddressFromPublicKey(publicKey.value)
    const mainBalance = await this.getBalanceOfAddress(address)
    const neuronBalance = await this.getNeuronBalance(publicKey)

    const totalBalance = newAmount(mainBalance.total)
      .blockchain(this.units)
      .toBigNumber()
      .plus(newAmount(neuronBalance).blockchain(this.units).toBigNumber())

    return {
      total: newAmount<ICPUnits>(totalBalance, 'blockchain'),
      transferable: mainBalance.total
    }
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<ICPUnits>> {
    if (!address) return { total: newAmount(0, 'blockchain') }
    const balance = await getBalanceFromAddress(address, this.options.network.rpcUrl, this.options.network.ledgerCanisterId)
    return { total: newAmount(balance.toString(10), 'blockchain') }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionFullConfiguration<ICPUnits>
  ): Promise<Amount<ICPUnits>> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const balanceBn = new BigNumber(newAmount(balance.total).value)

    let fee: BigNumber
    if (configuration?.fee !== undefined) {
      fee = new BigNumber(newAmount(configuration.fee).value)
    } else {
      const feeEstimation: Amount<ICPUnits> = await this.getTransactionFeeWithPublicKey(publicKey, [])
      fee = new BigNumber(newAmount(feeEstimation).value)
      if (fee.gte(balanceBn)) {
        fee = new BigNumber(0)
      }
    }

    let amountWithoutFees = balanceBn.minus(fee)
    if (amountWithoutFees.isNegative()) {
      amountWithoutFees = new BigNumber(0)
    }

    return newAmount(amountWithoutFees.toFixed(), 'blockchain')
  }

  // TODO : Get default from chain
  public async getTransactionFeeWithPublicKey(
    _publicKey: PublicKey,
    _details: TransactionDetails<ICPUnits>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<Amount<ICPUnits>> {
    // const ledger = LedgerCanister.create()
    // const feeDefault = await ledger.transactionFee()
    // return {
    //   low: newAmount(feeDefault.toString(10), 'ICP'),
    //   medium: newAmount(feeDefault.toString(10), 'ICP'),
    //   high: newAmount(feeDefault.toString(10), 'ICP')
    // }

    return this.feeDefaults.medium
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<ICPUnits>[],
    configuration?: TransactionFullConfiguration<ICPUnits>
  ): Promise<ICPUnsignedTransaction> {
    // Check balance
    const balance: Amount<ICPUnits> = newAmount((await this.getBalanceOfPublicKey(publicKey)).total).blockchain(this.units)
    const balanceBn: bigint = BigInt(balance.value)
    const feeBn: bigint =
      configuration?.fee !== undefined
        ? BigInt(newAmount(configuration.fee).blockchain(this.units).value)
        : BigInt(newAmount(this.feeDefaults.medium).blockchain(this.units).value)

    // Throw if not enough balance for fee
    if (balanceBn < feeBn) {
      throw new BalanceError(Domain.ICP, 'not enough balance')
    }

    const amountBn: bigint = BigInt(newAmount(details[0].amount).blockchain(this.units).value)

    // Create unsigned
    const unsignedTransaction = createUnsignedTransaction({
      to: details[0].to,
      amount: amountBn,
      fee: feeBn
    })

    return newUnsignedTransaction<ICPUnsignedTransaction>({
      transactions: [
        {
          actionType: ICPActionType.TRANSFER,
          encoded: unsignedTransaction
        }
      ]
    })
  }

  // TODO : discover how to get transaction hash after broadcast
  // https://github.com/dfinity/ic-js/tree/main/packages/nns
  // Search for : Transfer ICP from the caller to the destination accountIdentifier. Returns the index of the block containing the tx if it was successful.
  public async broadcastTransaction(transaction: ICPSignedTransaction): Promise<string> {
    for (const { actionType, encoded } of transaction.transactions) {
      const requestType = ICP_REQUEST_TYPE_PER_ACTION[actionType]
      if (requestType !== 'call') continue

      await broadcastTransaction(
        encoded,
        this.options.network.rpcUrl,
        this.canisterId[ICP_CANISTER_TYPE_PER_ACTION[actionType]],
        ICP_REQUEST_TYPE_PER_ACTION[actionType]
      )
    }

    return ''
  }

  public async sendQuery(transaction: ICPSignedTransaction): Promise<any[]> {
    return Promise.all(
      transaction.transactions
        .filter(({ actionType }) => ICP_REQUEST_TYPE_PER_ACTION[actionType] === 'query')
        .map(async ({ actionType, encoded }) => {
          const response = await broadcastTransaction(
            encoded,
            this.options.network.rpcUrl,
            this.canisterId[ICP_CANISTER_TYPE_PER_ACTION[actionType]],
            ICP_REQUEST_TYPE_PER_ACTION[actionType]
          )

          const queryResponse: QueryResponse = Cbor.decode(response)
          if (queryResponse.status == QueryResponseStatus.Rejected) {
            throw new NetworkError(Domain.ICP, {}, `Error (${queryResponse.reject_code}) ${queryResponse.reject_message}`)
          }

          return this.decodeQueryResponse(actionType, queryResponse.reply.arg)
        })
    )
  }

  private decodeQueryResponse(actionType: ICPActionType, response: ArrayBuffer): any {
    switch (actionType) {
      case ICPActionType.GET_NEURON_INFO:
        const NeuronId = IDL.Record({ id: IDL.Nat64 })

        const BallotInfo = IDL.Record({
          vote: IDL.Int32,
          proposal_id: IDL.Opt(NeuronId)
        })

        const DissolveState = IDL.Variant({
          DissolveDelaySeconds: IDL.Nat64,
          WhenDissolvedTimestampSeconds: IDL.Nat64
        })

        const Followees = IDL.Record({ followees: IDL.Vec(NeuronId) })

        const NeuronStakeTransfer = IDL.Record({
          to_subaccount: IDL.Vec(IDL.Nat8),
          neuron_stake_e8s: IDL.Nat64,
          from: IDL.Opt(IDL.Principal),
          memo: IDL.Nat64,
          from_subaccount: IDL.Vec(IDL.Nat8),
          transfer_timestamp: IDL.Nat64,
          block_height: IDL.Nat64
        })

        const KnownNeuronData = IDL.Record({
          name: IDL.Text,
          description: IDL.Opt(IDL.Text)
        })

        const Neuron = IDL.Record({
          id: IDL.Opt(NeuronId),
          staked_maturity_e8s_equivalent: IDL.Opt(IDL.Nat64),
          controller: IDL.Opt(IDL.Principal),
          recent_ballots: IDL.Vec(BallotInfo),
          kyc_verified: IDL.Bool,
          not_for_profit: IDL.Bool,
          maturity_e8s_equivalent: IDL.Nat64,
          cached_neuron_stake_e8s: IDL.Nat64,
          created_timestamp_seconds: IDL.Nat64,
          auto_stake_maturity: IDL.Opt(IDL.Bool),
          aging_since_timestamp_seconds: IDL.Nat64,
          hot_keys: IDL.Vec(IDL.Principal),
          account: IDL.Vec(IDL.Nat8),
          joined_community_fund_timestamp_seconds: IDL.Opt(IDL.Nat64),
          dissolve_state: IDL.Opt(DissolveState),
          followees: IDL.Vec(IDL.Tuple(IDL.Int32, Followees)),
          neuron_fees_e8s: IDL.Nat64,
          transfer: IDL.Opt(NeuronStakeTransfer),
          known_neuron_data: IDL.Opt(KnownNeuronData),
          spawn_at_timestamp_seconds: IDL.Opt(IDL.Nat64)
        })

        const GovernanceError = IDL.Record({
          error_message: IDL.Text,
          error_type: IDL.Int32
        })

        const Result = IDL.Variant({ Ok: Neuron, Err: GovernanceError })

        return IDL.decode([Result], response)[0]
      default:
        throw new UnsupportedError(Domain.ICP, `Decode response for action type ${actionType} is not supported`)
    }
  }

  // DELEGATION

  public async getDefaultDelegatee(): Promise<string> {
    const knownNeurons = await listKnownNeurons(this.options.network.rpcUrl, this.options.network.governanceCanisterId)
    const id = knownNeurons[0]?.id?.[0]?.id
    return id?.toString() || ''
  }

  public async getCurrentDelegateesForPublicKey(_publicKey: PublicKey, data?: { neuron?: Neuron }): Promise<string[]> {
    // Fetch neurons of address from governance canister (listNeurons)
    // Fetch followees from each neuron (get_full_neuron_by_id_or_subaccount)
    // Each of the functions needs a identity (signed user)

    return data?.neuron ? this.getNeuronFollowees(data.neuron) : []
  }

  public async getCurrentDelegateesForAddress(_address: string, _data?: any): Promise<string[]> {
    throw new UnsupportedError(Domain.ICP, '`getCurrentDelegateesForAddress` is not supported')
  }

  public async getDelegateeDetails(address: string, data?: { neuron?: Neuron }): Promise<ICPDelegateeDetails> {
    const partialNeuron = await getNeuronInfo(address, this.options.network.rpcUrl, this.options.network.governanceCanisterId)
    const neuronFolowees = data?.neuron ? this.getNeuronFollowees(data.neuron) : undefined

    return {
      name: partialNeuron?.known_neuron_data?.[0]?.name || '',
      address: address,
      status: neuronFolowees ? (neuronFolowees.includes(address) ? 'followed' : 'not-followed') : 'unknown',
      votingPower: partialNeuron?.voting_power?.toString() ?? '0'
    }
  }

  public async isPublicKeyDelegating(publicKey: PublicKey, data?: { neuron?: Neuron }): Promise<boolean> {
    const partialNeuron = await this.getNeuron(publicKey)
    if (partialNeuron === undefined || partialNeuron.stake_e8s <= BigInt(0)) {
      return false
    }

    const neuron = data?.neuron

    // Without full neuron data we can't be sure if we're actually delegating,
    // i.e. the neuron has followees. We assume, however, that if the neuron
    // has a stake, the public key is delegating.
    if (neuron === undefined) {
      return true
    }

    // We should check if partial and full neuron data describe the same neuron
    // but there's no neuron ID in partial neuron data
    if (partialNeuron.known_neuron_data[0]?.name !== neuron.known_neuron_data[0]?.name) {
      return true
    }

    return this.getNeuronFollowees(neuron).length > 0
  }

  public async isAddressDelegating(_address: Address, data?: any): Promise<boolean> {
    throw new UnsupportedError(Domain.ICP, '`isAddressDelegating` is not supported')
  }

  public async getDelegatorDetailsFromPublicKey(
    publicKey: PublicKey,
    data?: { followee?: string; neuron?: Neuron }
  ): Promise<ICPDelegatorDetails> {
    const fullNeuron = data?.neuron
    const address: string = await this.getAddressFromPublicKey(publicKey)
    const totalBalance = await this.getBalanceOfPublicKey(publicKey)
    const followees = fullNeuron ? this.getNeuronFollowees(fullNeuron) : []
    const availableActions = await this.getAvailableDelegatorActions(publicKey, data?.followee, fullNeuron)
    const neuronBalance = await this.getNeuronBalance(publicKey)
    const partialNeuron = await this.getNeuron(publicKey)

    const balance = newAmount(totalBalance.total).blockchain(this.units)
    const subaccountBalance = newAmount(neuronBalance).blockchain(this.units)

    return {
      address,
      balance: balance.value,
      delegatees: followees,
      availableActions: availableActions,
      subaccountBalance: subaccountBalance.value,
      stake: partialNeuron?.stake_e8s?.toString(),
      votingPower: partialNeuron?.voting_power?.toString(),
      age: partialNeuron?.age_seconds?.toString(),
      dissolveDelay: partialNeuron?.dissolve_delay_seconds?.toString(),
      maturity: fullNeuron?.maturity_e8s_equivalent?.toString()
    }
  }

  public async getDelegatorDetailsFromAddress(_address: Address, data?: any): Promise<ICPDelegatorDetails> {
    throw new UnsupportedError(Domain.ICP, '`getDelegatorDetailsFromAddress` is not supported')
  }

  public async getDelegationDetailsFromPublicKey(
    publicKey: PublicKey,
    delegatees: Address[],
    data?: { neuron?: Neuron }
  ): Promise<ICPDelegationDetails> {
    if (delegatees.length > 1) {
      return Promise.reject('Multiple followees for a single delegation are not supported.')
    }

    const followee = delegatees[0]
    const results = await Promise.all([
      this.getDelegatorDetailsFromPublicKey(publicKey, { ...data, followee }),
      this.getDelegateeDetails(followee, data)
    ])

    const delegatorDetails = results[0]
    const validatorDetails = results[1]

    return {
      delegator: delegatorDetails,
      delegatees: [validatorDetails]
    }
  }

  public async getDelegationDetailsFromAddress(_address: Address, _delegatees: Address[], _data?: any): Promise<ICPDelegationDetails> {
    throw new UnsupportedError(Domain.ICP, '`getDelegationDetailsFromAddress` is not supported')
  }

  private async getAvailableDelegatorActions(publicKey: PublicKey, followee?: string, fullNeuron?: Neuron): Promise<DelegatorAction[]> {
    const actions: DelegatorAction[] = []

    const results = await Promise.all([this.getBalanceOfPublicKey(publicKey), this.getNeuronBalance(publicKey), this.getNeuron(publicKey)])

    const transferableBalance = results[0].transferable ?? results[0].total
    const neuronBalance = results[1]
    const partialNeuron = results[2]

    const canStake = new BigNumber(transferableBalance.value).gt(0)
    const isStaking = new BigNumber(neuronBalance.value).gt(0)
    const hasNeuron = partialNeuron !== undefined
    const isNeuronUpToDate =
      !isStaking || (hasNeuron && partialNeuron.stake_e8s.toString() === newAmount(neuronBalance).blockchain(this.units).value)
    const canFollow = fullNeuron && followee ? !this.getNeuronFollowees(fullNeuron).includes(followee) : false
    const isDissolving = fullNeuron ? this.isNeuronDissolving(fullNeuron) : false
    const canDisburse = partialNeuron ? this.canNeuronDisburse(partialNeuron) : false

    if (canStake && isNeuronUpToDate) {
      actions.push({
        type: ICPStakingActionType.STAKE_AND_FOLLOW,
        args: ['followee', 'amount', 'delay']
      })
    }

    if (!canStake && isStaking && canFollow && isNeuronUpToDate) {
      actions.push({
        type: ICPStakingActionType.FOLLOW,
        args: ['followee']
      })
    }

    if (isStaking && isNeuronUpToDate) {
      actions.push({
        type: ICPStakingActionType.INCREASE_DISSOLVE_DELAY,
        args: ['delay']
      })
    }

    if (!isNeuronUpToDate) {
      actions.push({
        type: ICPStakingActionType.REFRESH_NEURON
      })
    }

    if (hasNeuron) {
      actions.push({
        type: ICPStakingActionType.GET_STAKING_DETAILS
      })
    }

    if (isStaking && hasNeuron && !isDissolving && fullNeuron !== undefined) {
      actions.push({
        type: ICPStakingActionType.START_DISSOLVING
      })
    }

    if (isDissolving) {
      actions.push({
        type: ICPStakingActionType.STOP_DISSOLVING
      })
    }

    if (canDisburse) {
      actions.push({
        type: ICPStakingActionType.DISBURSE_AND_UNFOLLOW
      })
    }

    return actions
  }

  public async prepareDelegatorActionFromPublicKey(
    publicKey: PublicKey,
    type: ICPStakingActionType,
    data?: any
  ): Promise<ICPUnsignedTransaction[]> {
    switch (type) {
      case ICPStakingActionType.GET_STAKING_DETAILS:
        return this.prepareGetStakingDetails()
      case ICPStakingActionType.STAKE_AND_FOLLOW:
        assertFields(`${type} action`, data, 'followee', 'amount', 'dissolveDelay')

        return this.prepareTransferToNeuronAndManage(publicKey, data.followee, data.amount, data.dissolveDelay)
      case ICPStakingActionType.FOLLOW:
        assertFields(`${type} action`, data, 'followee')

        return this.prepareFollowNeuron(publicKey, data.followee)
      case ICPStakingActionType.REFRESH_NEURON:
        return this.prepareClaimOrRefreshNeuron(publicKey)
      case ICPStakingActionType.INCREASE_DISSOLVE_DELAY:
        assertFields(`${type} action`, data, 'dissolveDelay')

        return this.prepareIncreaseDissolveDelay(publicKey, data.dissolveDelay)
      case ICPStakingActionType.START_DISSOLVING:
        return this.prepareStartDissolving(publicKey)
      case ICPStakingActionType.STOP_DISSOLVING:
        return this.prepareStopDissolving(publicKey)
      case ICPStakingActionType.DISBURSE_AND_UNFOLLOW:
        return this.prepareDisburseAndUnfollow(publicKey)
      default:
        return Promise.reject(`Delegator action type ${type} is not supported.`)
    }
  }

  private async prepareGetStakingDetails(): Promise<ICPUnsignedTransaction[]> {
    return [
      newUnsignedTransaction<ICPUnsignedTransaction>({
        transactions: await prepareGetNeuronInfo()
      })
    ]
  }

  private async prepareTransferToNeuronAndManage(
    publicKey: PublicKey,
    followee: string,
    amount: string,
    dissolveDelay: string
  ): Promise<ICPUnsignedTransaction[]> {
    const amountBigInt = BigInt(amount)
    const feeBigInt = BigInt(newAmount(this.feeDefaults.medium).blockchain(this.units).value)

    const partialNeuron = await this.getNeuron(publicKey)
    const currentDissolveDelay = partialNeuron?.dissolve_delay_seconds?.toString() ?? '0'
    const differenceInDissolveDelay = new BigNumber(dissolveDelay).minus(currentDissolveDelay)

    return [
      newUnsignedTransaction<ICPUnsignedTransaction>({
        transactions: flattenArray(
          await Promise.all([
            ...(amountBigInt > BigInt(0)
              ? [
                  prepareTransferToSubaccount(publicKey.value, this.options.network.governanceCanisterId, amountBigInt, feeBigInt),
                  prepareClaimOrRefreshNeuron(publicKey.value)
                ]
              : []),
            prepareFollowNeuron(publicKey.value, BigInt(followee)),
            differenceInDissolveDelay.gt(0)
              ? prepareIncreaseDissolveDelay(publicKey.value, BigInt(differenceInDissolveDelay.toFixed()))
              : Promise.resolve([]),
            prepareAutoStakeMaturity(publicKey.value)
          ])
        )
      })
    ]
  }

  private async prepareFollowNeuron(publicKey: PublicKey, followee: string): Promise<ICPUnsignedTransaction[]> {
    return [
      newUnsignedTransaction<ICPUnsignedTransaction>({
        transactions: await prepareFollowNeuron(publicKey.value, BigInt(followee))
      })
    ]
  }

  private async prepareClaimOrRefreshNeuron(publicKey: PublicKey): Promise<ICPUnsignedTransaction[]> {
    return [
      newUnsignedTransaction<ICPUnsignedTransaction>({
        transactions: await prepareClaimOrRefreshNeuron(publicKey.value)
      })
    ]
  }

  private async prepareIncreaseDissolveDelay(publicKey: PublicKey, dissolveDelay: string): Promise<ICPUnsignedTransaction[]> {
    const partialNeuron = await this.getNeuron(publicKey)
    const currentDissolveDelay = partialNeuron?.dissolve_delay_seconds?.toString() ?? '0'
    const differenceInDissolveDelay = new BigNumber(dissolveDelay).minus(currentDissolveDelay)

    return [
      newUnsignedTransaction<ICPUnsignedTransaction>({
        transactions: await prepareIncreaseDissolveDelay(publicKey.value, BigInt(differenceInDissolveDelay.toFixed()))
      })
    ]
  }

  private async prepareStartDissolving(publicKey: PublicKey): Promise<ICPUnsignedTransaction[]> {
    return [
      newUnsignedTransaction<ICPUnsignedTransaction>({
        transactions: await prepareStartDissolving(publicKey.value)
      })
    ]
  }

  private async prepareStopDissolving(publicKey: PublicKey): Promise<ICPUnsignedTransaction[]> {
    return [
      newUnsignedTransaction<ICPUnsignedTransaction>({
        transactions: await prepareStopDissolving(publicKey.value)
      })
    ]
  }

  private async prepareDisburseAndUnfollow(publicKey: PublicKey): Promise<ICPUnsignedTransaction[]> {
    return [
      newUnsignedTransaction<ICPUnsignedTransaction>({
        transactions: flattenArray(await Promise.all([prepareDisburse(publicKey.value), prepareFollowNeuron(publicKey.value, undefined)]))
      })
    ]
  }

  public async getMaxStakingAmount(publicKey: PublicKey): Promise<Amount<ICPUnits>> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const { subAccount } = getFixedSubaccountFromPublicKey(publicKey.value)
    const accountIdentifier = AccountIdentifier.fromPrincipal({
      principal: Principal.from(this.options.network.ledgerCanisterId),
      subAccount: subAccount
    })

    const fee = await this.getTransactionFeeWithPublicKey(publicKey, [
      {
        to: accountIdentifier.toHex(),
        amount: balance.transferable ?? balance.total
      }
    ])

    const maxAmount = newAmount(balance.transferable ?? balance.total)
      .blockchain(this.units)
      .toBigNumber()
      .minus(newAmount(fee).blockchain(this.units).value)

    return newAmount<ICPUnits>(maxAmount, 'blockchain')
  }

  public async getKnownNeurons(): Promise<KnownNeuron[]> {
    return listKnownNeurons(this.options.network.rpcUrl, this.options.network.governanceCanisterId)
  }

  private async getNeuron(publicKey: PublicKey): Promise<NeuronInfo | undefined> {
    const neuron = await getNeuronInfoBySubAccount(publicKey.value, this.options.network.rpcUrl, this.options.network.governanceCanisterId)
    return neuron
  }

  private async getNeuronBalance(publicKey: PublicKey): Promise<Amount<ICPUnits>> {
    // Create subaccount from publicKey
    const { subAccount, nonce: _ } = getFixedSubaccountFromPublicKey(publicKey.value)

    const accountIdentifier = AccountIdentifier.fromPrincipal({
      principal: Principal.from(this.options.network.governanceCanisterId),
      subAccount: subAccount
    })

    return this.getBalanceOfAddress(accountIdentifier.toHex()).then((balance: Balance<ICPUnits>) => balance.total)
  }

  private getNeuronFollowees(neuron: Neuron): string[] {
    const followees = flattenArray(neuron.followees.map(([_, { followees }]) => followees.map(({ id }) => id.toString())))

    return Array.from(new Set(followees))
  }

  private isNeuronDissolving(neuron: Neuron): boolean {
    const dissolveState = neuron.dissolve_state[0]

    return (
      dissolveState !== undefined &&
      'WhenDissolvedTimestampSeconds' in dissolveState &&
      dissolveState.WhenDissolvedTimestampSeconds > BigInt(0)
    )
  }

  private canNeuronDisburse(neuron: NeuronInfo): boolean {
    return neuron.dissolve_delay_seconds === BigInt(0) && neuron.stake_e8s > BigInt(0)
  }
}

// Factory

export function createICPProtocol(options: RecursivePartial<ICPProtocolOptions> = {}): ICPProtocol {
  return new ICPProtocolImpl(options)
}

export const ICP_MAINNET_PROTOCOL_NETWORK: ICPProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://boundary.ic0.app/',
  blockExplorerUrl: 'https://dashboard.internetcomputer.org/',
  blockExplorerApi: 'https://ledger-api.internetcomputer.org',
  ledgerCanisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  governanceCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
}

const DEFAULT_ICP_PROTOCOL_NETWORK: ICPProtocolNetwork = ICP_MAINNET_PROTOCOL_NETWORK

export function createICPProtocolOptions(network: Partial<ICPProtocolNetwork> = {}): ICPProtocolOptions {
  return {
    network: { ...DEFAULT_ICP_PROTOCOL_NETWORK, ...network }
  }
}
