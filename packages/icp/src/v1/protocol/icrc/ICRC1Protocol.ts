// tslint:disable: max-classes-per-file
import { assertNever, Domain, TransactionError } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { UnsupportedError } from '@airgap/coinlib-core/errors'
import { flattenArray } from '@airgap/coinlib-core/utils/array'
import {
  Address,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolAccountMetadata,
  ProtocolFeeMetadata,
  ProtocolMetadata,
  ProtocolTransactionMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  SecretKey,
  TransactionFullConfiguration,
  TransactionDetails,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'

import { ICPCryptoConfiguration } from '../../types/crypto'
import { ICRC1Account } from '../../types/icrc/account'
import { icrcIDLFactory, icrcIDLTypes } from '../../types/icrc/ledger'
import { ICRC1Metadata } from '../../types/icrc/metadata'
import { ICRC1TransferArgs } from '../../types/icrc/transfer'
import { ICRC1OfflineProtocolOptions, ICRC1OnlineProtocolOptions, ICRC1ProtocolNetwork } from '../../types/protocol'
import { ICPActionType, ICPSignedTransaction, ICPTransaction, ICPTransactionCursor, ICPUnsignedTransaction } from '../../types/transaction'
import { Actor, ActorSubclass } from '../../utils/actor'
import { AnonymousIdentity, Identity } from '../../utils/auth'
import * as Cbor from '../../utils/cbor'
import { hexStringToArrayBuffer } from '../../utils/convert'
import { HttpAgent } from '../../utils/http'
import {
  decodeICRC1Metadata,
  decodeICRC1TransferArgs,
  decodeOptionalICRC1Account,
  encodeICRC1Account,
  getDetailsFromTransferArgs,
  getICRC1AccountFromAddress,
  getICRC1AddressFromPublicKey
} from '../../utils/icrc1'
import * as IDL from '../../utils/idl'
import { Principal } from '../../utils/principal'
import Secp256k1KeyIdentity from '../../utils/secp256k1'
import { createHttpAgent, getPrincipalFromPublicKey, signTransaction } from '../ICPImplementation'
import { ICP_DERIVATION_PATH, ICPProtocol, ICPProtocolImpl } from '../ICPProtocol'

// Interface

export interface ICRC1OfflineProtocol<_Units extends string = string>
  extends AirGapOfflineProtocol<{
    AddressResult: Address
    CryptoConfiguration: ICPCryptoConfiguration
    Units: _Units
    SignedTransaction: ICPSignedTransaction
    UnsignedTransaction: ICPUnsignedTransaction
  }> {}

export interface ICRC1OnlineProtocol<
  _Units extends string = string,
  _ICRC1Metadata extends ICRC1Metadata = ICRC1Metadata,
  _ProtocolNetwork extends ICRC1ProtocolNetwork = ICRC1ProtocolNetwork
> extends AirGapOnlineProtocol<
    {
      AddressResult: Address
      ProtocolNetwork: _ProtocolNetwork
      Units: _Units
      FeeEstimation: Amount<_Units>
      SignedTransaction: ICPSignedTransaction
      UnsignedTransaction: ICPUnsignedTransaction
      TransactionCursor: ICPTransactionCursor
    },
    'FetchDataForAddress'
  > {
  name(): Promise<string>
  symbol(): Promise<string>
  decimals(): Promise<number>
  fee(): Promise<string>
  metadata(): Promise<_ICRC1Metadata>
  totalSupply(): Promise<string>
  mintingAccount(): Promise<ICRC1Account | undefined>

  balanceOf(account: ICRC1Account): Promise<string>
  transfer(privateKey: string, args: ICRC1TransferArgs): Promise<string>
}

// Implementation

export const ICRC1_ACCOUNT_METADATA: ProtocolAccountMetadata = {
  standardDerivationPath: ICP_DERIVATION_PATH,
  address: {
    isCaseSensitive: true,
    placeholder: '',
    regex: '^[a-z2-7-]+(.[a-f0-9]+)?$'
  }
}

function ICRC1_TRANSACTION_METADATA<_Units extends string>(): ProtocolTransactionMetadata<_Units> {
  return {
    arbitraryData: {
      inner: { name: 'memo' }
    }
  }
}

class ICRC1CommonProtocolImpl<_Units extends string> {
  // Common

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return getICRC1AddressFromPublicKey(publicKey.value)
  }

  public async getDetailsFromTransaction(
    transaction: ICPSignedTransaction | ICPUnsignedTransaction,
    publicKey: PublicKey,
    network: ICRC1ProtocolNetwork,
    defaultFee: Amount<_Units>
  ): Promise<AirGapTransaction<_Units>[]> {
    switch (transaction.type) {
      case 'signed':
        return this.getDetailsFromSignedTransaction(transaction, publicKey, network, defaultFee)
      case 'unsigned':
        return this.getDetailsFromUnsignedTransaction(transaction, publicKey, network, defaultFee)
      default:
        assertNever(transaction)
        throw new UnsupportedError(Domain.ICP, 'Unsupported transaction type.')
    }
  }

  private getDetailsFromSignedTransaction(
    transaction: ICPSignedTransaction,
    publicKey: PublicKey,
    network: ICRC1ProtocolNetwork,
    defaultFee: Amount<_Units>
  ): AirGapTransaction<_Units>[] {
    const transactions: AirGapTransaction<_Units>[][] = transaction.transactions.map(({ encoded, actionType }) => {
      switch (actionType) {
        case ICPActionType.TRANSFER:
          const decoded: any = Cbor.decode(hexStringToArrayBuffer(encoded))
          const transferArgs: ICRC1TransferArgs = decodeICRC1TransferArgs(decoded.content.arg)

          return getDetailsFromTransferArgs(transferArgs, publicKey.value, network, defaultFee)
        default:
          throw new UnsupportedError(Domain.ICP, `Unsupported ICRC1 action type ${actionType}.`)
      }
    })

    return flattenArray(transactions)
  }

  private getDetailsFromUnsignedTransaction(
    transaction: ICPUnsignedTransaction,
    publicKey: PublicKey,
    network: ICRC1ProtocolNetwork,
    defaultFee: Amount<_Units>
  ): AirGapTransaction<_Units>[] {
    const transactions: AirGapTransaction<_Units>[][] = transaction.transactions.map(({ encoded, actionType }) => {
      switch (actionType) {
        case ICPActionType.TRANSFER:
          const transferArgs: ICRC1TransferArgs = decodeICRC1TransferArgs(Buffer.from(encoded, 'hex'))

          return getDetailsFromTransferArgs(transferArgs, publicKey.value, network, defaultFee)
        default:
          throw new UnsupportedError(Domain.ICP, `Unsupported ICRC1 ${actionType} action type.`)
      }
    })

    return flattenArray(transactions)
  }
}

export abstract class ICRC1OfflineProtocolImpl<_Units extends string = string> implements ICRC1OfflineProtocol<_Units> {
  private readonly commonImpl: ICRC1CommonProtocolImpl<_Units>
  protected readonly icp: ICPProtocol

  protected constructor(private readonly options: ICRC1OfflineProtocolOptions<_Units>) {
    this.icp = new ICPProtocolImpl()
    this.commonImpl = new ICRC1CommonProtocolImpl()

    this.metadata = {
      identifier: options.identifier,
      name: options.name,

      units: options.units,
      mainUnit: options.mainUnit,

      fee: { defaults: options.feeDefaults },

      account: ICRC1_ACCOUNT_METADATA,
      transaction: ICRC1_TRANSACTION_METADATA<_Units>()
    }
  }

  // Common

  private readonly metadata: ProtocolMetadata<_Units>

  public async getMetadata(): Promise<ProtocolMetadata<_Units>> {
    return this.metadata
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return this.commonImpl.getAddressFromPublicKey(publicKey)
  }

  public async getDetailsFromTransaction(
    transaction: ICPSignedTransaction | ICPUnsignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<_Units>[]> {
    return this.commonImpl.getDetailsFromTransaction(
      transaction,
      publicKey,
      {
        ...(await this.icp.getNetwork()),
        ledgerCanisterId: this.options.ledgerCanisterId
      },
      this.options.feeDefaults.medium
    )
  }

  // Offline

  public async getCryptoConfiguration(): Promise<ICPCryptoConfiguration> {
    return this.icp.getCryptoConfiguration()
  }

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    return this.icp.getKeyPairFromDerivative(derivative)
  }

  public async signTransactionWithSecretKey(transaction: ICPUnsignedTransaction, secretKey: SecretKey): Promise<ICPSignedTransaction> {
    const transactions: ICPTransaction[] = await Promise.all(
      transaction.transactions.map(async ({ encoded, actionType }) => {
        switch (actionType) {
          case ICPActionType.TRANSFER:
            return {
              actionType,
              encoded: await signTransaction(
                secretKey.value,
                this.options.ledgerCanisterId,
                Buffer.from(encoded, 'hex'),
                'icrc1_transfer',
                'call'
              )
            }
          default:
            throw new UnsupportedError(Domain.ICP, `Unsupported ICRC1 action type ${actionType}.`)
        }
      })
    )

    return newSignedTransaction<ICPSignedTransaction>({ transactions })
  }
}

export abstract class ICRC1OnlineProtocolImpl<
  _Units extends string = string,
  _ICRC1Metadata extends ICRC1Metadata = ICRC1Metadata,
  _ProtocolNetwork extends ICRC1ProtocolNetwork = ICRC1ProtocolNetwork
> implements ICRC1OnlineProtocol<_Units, _ICRC1Metadata, _ProtocolNetwork>
{
  private readonly commonImpl: ICRC1CommonProtocolImpl<_Units>
  protected readonly icp: ICPProtocol

  protected constructor(protected readonly options: ICRC1OnlineProtocolOptions<_ProtocolNetwork, _Units>) {
    this.icp = new ICPProtocolImpl({ network: options.network })
    this.commonImpl = new ICRC1CommonProtocolImpl()
  }

  // Common

  private _metadata: ProtocolMetadata<_Units> | undefined = undefined
  public async getMetadata(): Promise<ProtocolMetadata<_Units>> {
    if (this._metadata === undefined) {
      this._metadata = {
        identifier: this.options.identifier,
        ...(await this.getPartialMetadata()),
        account: ICRC1_ACCOUNT_METADATA,
        transaction: ICRC1_TRANSACTION_METADATA<_Units>()
      }
    }

    return this._metadata
  }

  private async getPartialMetadata(): Promise<{
    name: string
    units: ProtocolUnitsMetadata<_Units>
    mainUnit: _Units
    fee: ProtocolFeeMetadata<_Units>
  }> {
    const mainUnit: _Units | undefined =
      this.options.mainUnit ?? (this.options.units ? (Object.keys(this.options.units)[0] as _Units) : undefined)

    if (this.options.name && this.options.units && mainUnit) {
      return {
        name: this.options.name,
        units: this.options.units,
        mainUnit,
        fee: {
          defaults: this.options.feeDefaults,
          units: this.options.units,
          mainUnit
        }
      }
    }

    const icrc1Metadata: ICRC1Metadata = await this.metadata()
    const [name, symbol, decimals, feeDefaults]: [string, _Units, number, FeeDefaults<_Units>] = await Promise.all([
      this.options.name ? Promise.resolve(this.options.name) : icrc1Metadata.name ? Promise.resolve(icrc1Metadata.name) : this.name(),
      mainUnit
        ? Promise.resolve(mainUnit)
        : (icrc1Metadata.symbol ? Promise.resolve(icrc1Metadata.symbol) : this.symbol()).then((symbol: string) => symbol as _Units),
      mainUnit && this.options.units
        ? Promise.resolve(this.options.units[mainUnit].decimals)
        : icrc1Metadata.decimals
        ? Promise.resolve(icrc1Metadata.decimals)
        : this.decimals(),
      this.options.feeDefaults
        ? Promise.resolve(this.options.feeDefaults)
        : (icrc1Metadata.fee ? Promise.resolve(icrc1Metadata.fee) : this.fee()).then(
            (fee: string): FeeDefaults<_Units> => ({
              low: newAmount(fee, 'blockchain'),
              medium: newAmount(fee, 'blockchain'),
              high: newAmount(fee, 'blockchain')
            })
          )
    ])

    const fetchedUnits: ProtocolUnitsMetadata = {
      [symbol]: {
        symbol: { value: symbol },
        decimals
      }
    }

    return {
      name,
      units: this.options.units ?? fetchedUnits,
      mainUnit: symbol,
      fee: {
        defaults: feeDefaults
      }
    }
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return this.commonImpl.getAddressFromPublicKey(publicKey)
  }

  public async getDetailsFromTransaction(
    transaction: ICPSignedTransaction | ICPUnsignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<_Units>[]> {
    const fee: string = await this.fee()

    return this.commonImpl.getDetailsFromTransaction(transaction, publicKey, this.options.network, newAmount(fee, 'blockchain'))
  }

  // Online

  public async getNetwork(): Promise<_ProtocolNetwork> {
    return this.options.network
  }

  public abstract getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: ICPTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<ICPTransactionCursor, _Units>>

  public abstract getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: ICPTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<ICPTransactionCursor, _Units>>

  public async getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance<_Units>> {
    const principal: Principal = getPrincipalFromPublicKey(publicKey.value)

    return this.getBalanceOfAccount({ owner: principal.toText() })
  }

  public async getBalanceOfAddress(address: string): Promise<Balance<_Units>> {
    const account: ICRC1Account = getICRC1AccountFromAddress(address)

    return this.getBalanceOfAccount(account)
  }

  private async getBalanceOfAccount(account: ICRC1Account): Promise<Balance<_Units>> {
    const balance: string = await this.balanceOf(account)

    return { total: newAmount(balance, 'blockchain') }
  }

  public async getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: string[],
    configuration?: TransactionFullConfiguration<_Units>
  ): Promise<Amount<_Units>> {
    const balance = await this.getBalanceOfPublicKey(publicKey)
    const balanceBn = new BigNumber(newAmount(balance.total).value)

    let fee: BigNumber
    if (configuration?.fee !== undefined) {
      fee = new BigNumber(newAmount(configuration.fee).value)
    } else {
      const feeEstimation: Amount<_Units> = await this.getTransactionFeeWithPublicKey(publicKey, [])
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

  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    _configuration?: TransactionSimpleConfiguration
  ): Promise<Amount<_Units>> {
    const metadata: ProtocolMetadata<_Units> = await this.getMetadata()
    if (metadata.fee?.defaults) {
      return newAmount(metadata.fee.defaults.medium).blockchain(metadata.units)
    }

    const fee: string = await this.fee()

    return newAmount(fee, 'blockchain')
  }

  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<_Units>[],
    configuration?: TransactionFullConfiguration<_Units>
  ): Promise<ICPUnsignedTransaction> {
    const { TransferArg } = icrcIDLTypes(IDL)
    const metadata: ProtocolMetadata<_Units> = await this.getMetadata()

    const to: ICRC1Account = getICRC1AccountFromAddress(details[0].to)
    const amount: Amount<_Units> = newAmount(details[0].amount).blockchain(metadata.units)
    const fee: Amount<_Units> = configuration?.fee
      ? newAmount(configuration.fee).blockchain(metadata.units)
      : newAmount(await this.fee(), 'blockchain')

    const memo: string | undefined = details[0].arbitraryData

    const transferArg = {
      to: {
        owner: Principal.fromText(to.owner),
        subaccount: to.subaccount ? [Buffer.from(to.subaccount, 'hex')] : []
      },
      fee: [BigInt(fee.value)],
      memo: memo ? [Buffer.from(memo, 'hex')] : [],
      from_subaccount: [],
      created_at_time: [],
      amount: BigInt(amount.value)
    }

    const encodedTransferArg: Buffer = Buffer.from(IDL.encode([TransferArg], [transferArg]))

    return newUnsignedTransaction<ICPUnsignedTransaction>({
      transactions: [
        {
          actionType: ICPActionType.TRANSFER,
          encoded: encodedTransferArg.toString('hex')
        }
      ]
    })
  }

  public async broadcastTransaction(transaction: ICPSignedTransaction): Promise<string> {
    return this.icp.broadcastTransaction(transaction)
  }

  // Custom

  private _name: string | undefined = undefined
  public async name(): Promise<string> {
    if (!this._name) {
      const actor: ActorSubclass = this.createLedgerActor()
      const name: unknown = await actor.icrc1_name()

      this._name = name as string
    }

    return this._name
  }

  private _symbol: string | undefined = undefined
  public async symbol(): Promise<string> {
    if (!this._symbol) {
      const actor: ActorSubclass = this.createLedgerActor()
      const symbol: unknown = await actor.icrc1_symbol()

      this._symbol = symbol as string
    }

    return this._symbol
  }

  private _decimals: number | undefined = undefined
  public async decimals(): Promise<number> {
    if (!this._decimals) {
      const actor: ActorSubclass = this.createLedgerActor()
      const decimals: unknown = await actor.icrc1_decimals()

      this._decimals = decimals as number
    }

    return this._decimals
  }

  private _fee: string | undefined = undefined
  public async fee(): Promise<string> {
    if (!this._fee) {
      const actor: ActorSubclass = this.createLedgerActor()
      const fee: unknown = await actor.icrc1_fee()

      this._fee = (fee as bigint).toString()
    }

    return this._fee
  }

  public abstract metadata(): Promise<_ICRC1Metadata>

  private _baseMetadata: (ICRC1Metadata & Record<string, any>) | undefined = undefined
  protected async baseMetadata(): Promise<ICRC1Metadata & Record<string, any>> {
    if (!this._baseMetadata) {
      const actor: ActorSubclass = this.createLedgerActor()
      const metadata: unknown = await actor.icrc1_metadata()

      this._baseMetadata = decodeICRC1Metadata(metadata)
    }

    return this._baseMetadata
  }

  private _totalSupply: string | undefined = undefined
  public async totalSupply(): Promise<string> {
    if (!this._totalSupply) {
      const actor: ActorSubclass = this.createLedgerActor()
      const totalSupply: unknown = await actor.icrc1_total_supply()

      this._totalSupply = (totalSupply as bigint).toString()
    }

    return this._totalSupply
  }

  private _mintingAccount: ICRC1Account | undefined | null = null
  public async mintingAccount(): Promise<ICRC1Account | undefined> {
    if (this._mintingAccount === null) {
      const actor: ActorSubclass = this.createLedgerActor()
      const mintingAccount: unknown = await actor.icrc1_minting_account()

      this._mintingAccount = decodeOptionalICRC1Account(mintingAccount)
    }

    return this._mintingAccount
  }

  public async balanceOf(account: ICRC1Account): Promise<string> {
    const actor: ActorSubclass = this.createLedgerActor()
    const balance: unknown = await actor.icrc1_balance_of(encodeICRC1Account(account))

    return balance as string
  }

  public async transfer(privateKey: string, args: ICRC1TransferArgs): Promise<string> {
    const actor: ActorSubclass = this.createLedgerActor(
      icrcIDLFactory,
      Secp256k1KeyIdentity.fromSecretKey(hexStringToArrayBuffer(privateKey))
    )
    const result: any = await actor.icrc1_transfer({
      to: encodeICRC1Account(args.to),
      fee: args.fee ? [BigInt(args.fee)] : [],
      memo: args.memo ? [Buffer.from(args.memo)] : [],
      from_subaccount: args.fromSubaccount ? [Buffer.from(args.fromSubaccount)] : [],
      created_at_time: args.createdAtTime ? [BigInt(args.createdAtTime)] : [],
      amount: BigInt(args.amount)
    })

    if (result.Ok) {
      return (result.Ok as bigint).toString()
    } else {
      throw new TransactionError(
        Domain.ICP,
        `ICRC1 transfer failed (${result.Err.GenericError.error_code.toString()}: ${result.Err.GenericError.message})`
      )
    }
  }

  protected createLedgerActor(
    idlFactory: IDL.InterfaceFactory = icrcIDLFactory,
    identity: Identity = new AnonymousIdentity()
  ): ActorSubclass {
    return this.createActor(this.options.network.ledgerCanisterId, idlFactory, identity)
  }

  protected createActor(
    canisterId: string,
    idlFactory: IDL.InterfaceFactory = icrcIDLFactory,
    identity: Identity = new AnonymousIdentity()
  ): ActorSubclass {
    const agent: HttpAgent = createHttpAgent(this.options.network.rpcUrl, identity)

    return Actor.createActor(idlFactory, { agent, canisterId })
  }
}
