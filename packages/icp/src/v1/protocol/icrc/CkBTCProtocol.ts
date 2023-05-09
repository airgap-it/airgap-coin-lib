// tslint:disable: max-classes-per-file
import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { OperationFailedError } from '@airgap/coinlib-core/errors'
import {
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  FeeDefaults,
  newAmount,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial
} from '@airgap/module-kit'

import { CkBTCMetadata } from '../../types/ckbtc/metadata'
import { ICRC1Account } from '../../types/icrc/account'
import { ICRC1Metadata } from '../../types/icrc/metadata'
import { CkBTCOfflineProtocolOptions, CkBTCOnlineProtocolOptions, CkBTCProtocolNetwork, CkBTCUnits } from '../../types/protocol'
import { ICPTransactionCursor } from '../../types/transaction'
import { ActorSubclass } from '../../utils/actor'
import { AnonymousIdentity, Identity } from '../../utils/auth'
import { encodeICRC1Account, getICRC1AccountFromAddress, getICRC1AddressFromPrincipal } from '../../utils/icrc1'

import { ICRC1OfflineProtocol, ICRC1OfflineProtocolImpl, ICRC1OnlineProtocol, ICRC1OnlineProtocolImpl } from './ICRC1Protocol'

// Interface

export interface CkBTCOfflineProtocol extends ICRC1OfflineProtocol<CkBTCUnits> {}
export interface CkBTCOnlineProtocol extends ICRC1OnlineProtocol<CkBTCUnits, CkBTCMetadata> {}

// Implementation

const CKBTC_METADATA: {
  identifier: string
  name: string
  units: ProtocolUnitsMetadata<CkBTCUnits>
  mainUnit: CkBTCUnits
  feeDefaults: FeeDefaults<CkBTCUnits>
} = {
  identifier: MainProtocolSymbols.ICP_CKBTC,
  name: 'Chain Key Bitcoin',
  units: {
    ckBTC: {
      symbol: { value: 'ckBTC', market: 'btc' },
      decimals: 8
    }
  },
  mainUnit: 'ckBTC',
  feeDefaults: {
    low: newAmount(10, 'blockchain'),
    medium: newAmount(10, 'blockchain'),
    high: newAmount(10, 'blockchain')
  }
}

class CkBTCOfflineProtocolImpl extends ICRC1OfflineProtocolImpl<CkBTCUnits> implements CkBTCOfflineProtocol {
  public constructor(options: RecursivePartial<CkBTCOfflineProtocolOptions>) {
    const completeOptions: CkBTCOfflineProtocolOptions = createCkBTCOfflineProtocolOptions(options.ledgerCanisterId)

    super({
      ...completeOptions,
      ...CKBTC_METADATA
    })
  }
}

class CkBTCOnlineProtocolImpl
  extends ICRC1OnlineProtocolImpl<CkBTCUnits, CkBTCMetadata, CkBTCProtocolNetwork>
  implements CkBTCOnlineProtocol
{
  public constructor(options: RecursivePartial<CkBTCOnlineProtocolOptions>) {
    const completeOptions: CkBTCOnlineProtocolOptions = createCkBTCOnlineProtocolOptions(options.network)

    super({
      ...completeOptions,
      ...CKBTC_METADATA
    })
  }

  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: ICPTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<ICPTransactionCursor, CkBTCUnits>> {
    const address: string = await this.getAddressFromPublicKey(publicKey)

    return this.getTransactionsForAddress(address, limit, cursor)
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: ICPTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<ICPTransactionCursor, CkBTCUnits>> {
    const actor: ActorSubclass = this.createIndexerActor()

    const account: ICRC1Account = getICRC1AccountFromAddress(address)
    const defaultFee: string = await this.fee()

    const getTransactionsResult: any = await actor.get_account_transactions({
      account: encodeICRC1Account(account),
      start: cursor?.next ? [BigInt(cursor.next)] : [],
      max_results: BigInt(limit + 1)
    })

    if (getTransactionsResult.Err) {
      throw new OperationFailedError(Domain.ICP, `ICRC1 get transactions failed (${getTransactionsResult.Err.message})`)
    }

    const okResult: any = getTransactionsResult.Ok

    const transactions: any[] = okResult.transactions as any[]
    const last: string | undefined =
      okResult.oldest_tx_id && (okResult.oldest_tx_id as any[]).length > 0 ? (okResult.oldest_tx_id[0] as bigint).toString() : undefined

    const airGapTransactions: AirGapTransaction<CkBTCUnits>[] = transactions
      .map((transactionWithId) => {
        const transaction = transactionWithId.transaction
        const timestamp: number = Number(transaction.timestamp) / 1_000_000_000 // ns to s

        if (transaction.kind === 'transfer' && transaction.transfer[0]) {
          const transfer = transaction.transfer[0]

          const from: string = getICRC1AddressFromPrincipal(transfer.from.owner, transfer.from.subaccount[0])
          const to: string = getICRC1AddressFromPrincipal(transfer.to.owner, transfer.to.subaccount[0])

          return {
            from: [from],
            to: [to],
            isInbound: to === address,

            amount: newAmount((transfer.amount as bigint).toString(), 'blockchain'),
            fee:
              transfer.fee && transfer.fee[0]
                ? newAmount((transfer.fee[0] as bigint).toString(), 'blockchain')
                : newAmount(defaultFee, 'blockchain'),

            network: this.options.network,
            status: {
              type: 'applied'
            },
            timestamp,

            arbitraryData: transfer.memo && transfer.memo[0] ? Buffer.from(transfer.memo[0]).toString('hex') : undefined
          }
        } else if (transaction.kind === 'burn' && transaction.burn[0]) {
          const burn = transaction.burn[0]

          return {
            from: [getICRC1AddressFromPrincipal(burn.from.owner, burn.from.subaccount[0])],
            to: ['Burn'],
            isInbound: false,

            amount: newAmount((burn.amount as bigint).toString(), 'blockchain'),
            fee: newAmount(0, 'blockchain'), // TODO: 0 or defaultFee?

            type: 'burn',
            network: this.options.network,
            status: {
              type: 'applied'
            },
            timestamp,

            arbitraryData: burn.memo && burn.memo[0] ? Buffer.from(burn.memo[0]).toString('hex') : undefined
          }
        } else if (transaction.kind === 'mint' && transaction.mint[0]) {
          const mint = transaction.mint[0]

          return {
            from: ['Mint'],
            to: [getICRC1AddressFromPrincipal(mint.to.owner, mint.to.subaccount[0])],
            isInbound: false,

            amount: newAmount((mint.amount as bigint).toString(), 'blockchain'),
            fee: newAmount(0, 'blockchain'), // TODO: 0 or defaultFee?

            type: 'mint',
            network: this.options.network,
            status: {
              type: 'applied'
            },
            timestamp,

            arbitraryData: mint.memo && mint.memo[0] ? Buffer.from(mint.memo[0]).toString('hex') : undefined
          }
        }

        return undefined
      })
      .filter((tx) => tx !== undefined) as AirGapTransaction<CkBTCUnits>[]

    const next: string = transactions.length > 0 ? (transactions.slice(-1)[0].id as bigint).toString() : ''
    const hasNext: boolean = airGapTransactions.length > limit || next !== last

    return {
      transactions: airGapTransactions.length <= limit ? airGapTransactions : airGapTransactions.slice(0, -1),
      cursor: {
        hasNext,
        next
      }
    }
  }

  public async metadata(): Promise<CkBTCMetadata> {
    const baseMetadata: ICRC1Metadata & Record<string, any> = await this.baseMetadata()
    const { symbol, name, decimals, fee } = baseMetadata

    return {
      symbol,
      name,
      decimals,
      fee,
      logo: baseMetadata['icrc1:logo'].Text
    }
  }

  // Custom

  private createIndexerActor(identity: Identity = new AnonymousIdentity()): ActorSubclass {
    return this.createActor(
      this.options.network.indexerCanisterId,
      ({ IDL }) => {
        const TxId = IDL.Nat
        const Account = IDL.Record({
          owner: IDL.Principal,
          subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
        })
        const GetAccountTransactionsArgs = IDL.Record({
          max_results: IDL.Nat,
          start: IDL.Opt(TxId),
          account: Account
        })
        const Transaction = IDL.Record({
          burn: IDL.Opt(
            IDL.Record({
              from: Account,
              memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
              created_at_time: IDL.Opt(IDL.Nat64),
              amount: IDL.Nat
            })
          ),
          kind: IDL.Text,
          mint: IDL.Opt(
            IDL.Record({
              to: Account,
              memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
              created_at_time: IDL.Opt(IDL.Nat64),
              amount: IDL.Nat
            })
          ),
          timestamp: IDL.Nat64,
          transfer: IDL.Opt(
            IDL.Record({
              to: Account,
              fee: IDL.Opt(IDL.Nat),
              from: Account,
              memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
              created_at_time: IDL.Opt(IDL.Nat64),
              amount: IDL.Nat
            })
          )
        })
        const TransactionWithId = IDL.Record({
          id: TxId,
          transaction: Transaction
        })
        const GetTransactions = IDL.Record({
          transactions: IDL.Vec(TransactionWithId),
          oldest_tx_id: IDL.Opt(TxId)
        })
        const GetTransactionsErr = IDL.Record({ message: IDL.Text })
        const GetTransactionsResult = IDL.Variant({
          Ok: GetTransactions,
          Err: GetTransactionsErr
        })

        return IDL.Service({
          get_account_transactions: IDL.Func([GetAccountTransactionsArgs], [GetTransactionsResult], [])
        })
      },
      identity
    )
  }
}

// Factory

export function createCkBTCOfflineProtocol(options: RecursivePartial<CkBTCOfflineProtocolOptions> = {}): CkBTCOfflineProtocol {
  return new CkBTCOfflineProtocolImpl(options)
}

export function createCkBTCOnlineProtocol(options: RecursivePartial<CkBTCOnlineProtocolOptions> = {}): CkBTCOnlineProtocol {
  return new CkBTCOnlineProtocolImpl(options)
}

export const CKBTC_MAINNET_PROTOCOL_NETWORK: CkBTCProtocolNetwork = {
  name: 'Mainnet',
  type: 'mainnet',
  rpcUrl: 'https://boundary.ic0.app/',
  ledgerCanisterId: 'mxzaz-hqaaa-aaaar-qaada-cai',
  indexerCanisterId: 'n5wcd-faaaa-aaaar-qaaea-cai',
  governanceCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
  explorerUrl: 'https://ledger-api.internetcomputer.org'
}

const DEFAULT_CKBTC_PROTOCOL_NETWORK: CkBTCProtocolNetwork = CKBTC_MAINNET_PROTOCOL_NETWORK

export function createCkBTCOfflineProtocolOptions(ledgerCanisterId?: string): CkBTCOfflineProtocolOptions {
  return {
    ledgerCanisterId: ledgerCanisterId ?? DEFAULT_CKBTC_PROTOCOL_NETWORK.ledgerCanisterId
  }
}

export function createCkBTCOnlineProtocolOptions(network: Partial<CkBTCProtocolNetwork> = {}): CkBTCOnlineProtocolOptions {
  return {
    network: { ...DEFAULT_CKBTC_PROTOCOL_NETWORK, ...network }
  }
}
