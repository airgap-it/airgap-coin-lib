import { assertNever, Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { BalanceError, ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
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
  TransactionConfiguration,
  TransactionDetails
} from '@airgap/module-kit'

import { ICPCryptoConfiguration } from '../types/crypto'
import { ICPProtocolNetwork, ICPProtocolOptions, ICPUnits } from '../types/protocol'
import { ICPSignedTransaction, ICPTransactionCursor, ICPUnsignedTransaction } from '../types/transaction'
import { uint8ArrayToHexString } from '../utils/convert'

import {
  broadcastTransaction,
  createUnsignedTransaction,
  decodeArguments,
  getAddressFromPublicKey,
  getBalanceFromAddress,
  getInfoFromSignedTransaction,
  getInfoFromUnsignedTransaction,
  getKeyPairFromExtendedSecretKey,
  signICPTransaction
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
      FeeEstimation: FeeDefaults<ICPUnits>
      UnsignedTransaction: ICPUnsignedTransaction
    },
    'FetchDataForAddress'
  > {}

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

  public constructor(options: RecursivePartial<ICPProtocolOptions> = {}) {
    this.options = createICPProtocolOptions(options.network)
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
    _publicKey: PublicKey
  ): Promise<AirGapTransaction<ICPUnits>[]> {
    switch (transaction.type) {
      case 'signed':
        const signedTransactionInfo = getInfoFromSignedTransaction(transaction.transaction)
        const args = decodeArguments(signedTransactionInfo.content.arg)[0]
        return [
          {
            from: [getAddressFromPublicKey(_publicKey.value)],
            to: [uint8ArrayToHexString(args.to)],
            isInbound: false,
            amount: newAmount(args.amount.e8s.toString(), 'blockchain'),
            fee: newAmount(args.fee.e8s.toString(), 'blockchain'),
            network: this.options.network
          }
        ]
      case 'unsigned':
        const unsignedTransactionInfo = getInfoFromUnsignedTransaction(transaction.transaction)
        return [
          {
            from: [getAddressFromPublicKey(_publicKey.value)],
            to: [unsignedTransactionInfo.to],
            isInbound: false,
            amount: newAmount(unsignedTransactionInfo.amount.toString(), 'blockchain'),
            fee: newAmount(unsignedTransactionInfo.fee.toString(), 'blockchain'),
            network: this.options.network
          }
        ]
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.ICP, 'Unsupported transaction type.')
    }
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
    const signedTransaction = await signICPTransaction(transaction.transaction, secretKey.value, this.options.network.ledgerCanisterId)

    return newSignedTransaction<ICPSignedTransaction>({ transaction: signedTransaction })
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
    const url = endpoint !== undefined ? `${this.options.network.explorerUrl}${endpoint}` : undefined
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
    return this.getBalanceOfAddress(address)
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<ICPUnits>> {
    if (!address) return { total: newAmount(0, 'blockchain') }
    const balance = await getBalanceFromAddress(address, this.options.network.rpcUrl, this.options.network.ledgerCanisterId)
    return { total: newAmount(balance.toString(10), 'blockchain') }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionConfiguration<ICPUnits>
  ): Promise<Amount<ICPUnits>> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const balanceBn = new BigNumber(newAmount(balance.total).value)

    let fee: BigNumber
    if (configuration?.fee !== undefined) {
      fee = new BigNumber(newAmount(configuration.fee).value)
    } else {
      const feeEstimation: FeeDefaults<ICPUnits> = await this.getTransactionFeeWithPublicKey(publicKey, [])
      fee = new BigNumber(newAmount(feeEstimation.medium).value)
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
    _details: TransactionDetails<ICPUnits>[]
  ): Promise<FeeDefaults<ICPUnits>> {
    // const ledger = LedgerCanister.create()
    // const feeDefault = await ledger.transactionFee()
    // return {
    //   low: newAmount(feeDefault.toString(10), 'ICP'),
    //   medium: newAmount(feeDefault.toString(10), 'ICP'),
    //   high: newAmount(feeDefault.toString(10), 'ICP')
    // }

    return this.feeDefaults
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<ICPUnits>[],
    configuration?: TransactionConfiguration<ICPUnits>
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

    // Transaction object
    const transaction = {
      from: getAddressFromPublicKey(publicKey.value),
      to: details[0].to,
      amount: amountBn,
      fee: feeBn
    }

    // Create unsigned
    const unsignedTransaction = createUnsignedTransaction(transaction)

    return newUnsignedTransaction<ICPUnsignedTransaction>({
      transaction: unsignedTransaction,
      networkId: this.networkId()
    })
  }

  private networkId(): string {
    switch (this.options.network.type) {
      case 'mainnet':
        return 'icp_mainnet'
      default:
        throw new ConditionViolationError(Domain.ICP, 'Network type not supported.')
    }
  }

  // TODO : discover how to get transaction hash after broadcast
  // https://github.com/dfinity/ic-js/tree/main/packages/nns
  // Search for : Transfer ICP from the caller to the destination accountIdentifier. Returns the index of the block containing the tx if it was successful.
  public async broadcastTransaction(transaction: ICPSignedTransaction): Promise<string> {
    return await broadcastTransaction(transaction.transaction, this.options.network.rpcUrl, this.options.network.ledgerCanisterId)
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
  ledgerCanisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  explorerUrl: 'https://ledger-api.internetcomputer.org'
}

const DEFAULT_ICP_PROTOCOL_NETWORK: ICPProtocolNetwork = ICP_MAINNET_PROTOCOL_NETWORK

export function createICPProtocolOptions(network: Partial<ICPProtocolNetwork> = {}): ICPProtocolOptions {
  return {
    network: { ...DEFAULT_ICP_PROTOCOL_NETWORK, ...network }
  }
}
