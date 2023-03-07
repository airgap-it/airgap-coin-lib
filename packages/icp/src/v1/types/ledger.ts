import { ActorMethod } from '../utils/actor'
import * as IDL from '../utils/idl'
import { Principal } from '../utils/principal'

const AccountIdentifier = IDL.Vec(IDL.Nat8)
const AccountBalanceArgs = IDL.Record({ account: AccountIdentifier })
const Tokens = IDL.Record({ e8s: IDL.Nat64 })
const Archive = IDL.Record({ canister_id: IDL.Principal })
const Archives = IDL.Record({ archives: IDL.Vec(Archive) })
const BlockIndex = IDL.Nat64
const GetBlocksArgs = IDL.Record({
  start: BlockIndex,
  length: IDL.Nat64
})
const Memo = IDL.Nat64
const Operation = IDL.Variant({
  Burn: IDL.Record({ from: AccountIdentifier, amount: Tokens }),
  Mint: IDL.Record({ to: AccountIdentifier, amount: Tokens }),
  Transfer: IDL.Record({
    to: AccountIdentifier,
    fee: Tokens,
    from: AccountIdentifier,
    amount: Tokens
  })
})
const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 })
const Transaction = IDL.Record({
  memo: Memo,
  operation: IDL.Opt(Operation),
  created_at_time: TimeStamp
})
const Block = IDL.Record({
  transaction: Transaction,
  timestamp: TimeStamp,
  parent_hash: IDL.Opt(IDL.Vec(IDL.Nat8))
})
const BlockRange = IDL.Record({ blocks: IDL.Vec(Block) })
const QueryArchiveError = IDL.Variant({
  BadFirstBlockIndex: IDL.Record({
    requested_index: BlockIndex,
    first_valid_index: BlockIndex
  }),
  Other: IDL.Record({
    error_message: IDL.Text,
    error_code: IDL.Nat64
  })
})
const QueryArchiveResult = IDL.Variant({
  Ok: BlockRange,
  Err: QueryArchiveError
})
const QueryArchiveFn = IDL.Func([GetBlocksArgs], [QueryArchiveResult], ['query'])
const QueryBlocksResponse = IDL.Record({
  certificate: IDL.Opt(IDL.Vec(IDL.Nat8)),
  blocks: IDL.Vec(Block),
  chain_length: IDL.Nat64,
  first_block_index: BlockIndex,
  archived_blocks: IDL.Vec(
    IDL.Record({
      callback: QueryArchiveFn,
      start: BlockIndex,
      length: IDL.Nat64
    })
  )
})
const SubAccount = IDL.Vec(IDL.Nat8)
const TransferArgs = IDL.Record({
  to: AccountIdentifier,
  fee: Tokens,
  memo: Memo,
  from_subaccount: IDL.Opt(SubAccount),
  created_at_time: IDL.Opt(TimeStamp),
  amount: Tokens
})
const TransferError = IDL.Variant({
  TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
  BadFee: IDL.Record({ expected_fee: Tokens }),
  TxDuplicate: IDL.Record({ duplicate_of: BlockIndex }),
  TxCreatedInFuture: IDL.Null,
  InsufficientFunds: IDL.Record({ balance: Tokens })
})
const TransferResult = IDL.Variant({
  Ok: BlockIndex,
  Err: TransferError
})
const TransferFeeArg = IDL.Record({})
const TransferFee = IDL.Record({ transfer_fee: Tokens })

export const AccountBalanceFn = IDL.Func([AccountBalanceArgs], [Tokens], [])
export const TransferFn = IDL.Func([TransferArgs], [TransferResult], [])

export interface AccountBalanceArgs {
  account: AccountIdentifier
}
export type AccountIdentifier = Uint8Array
export interface Archive {
  canister_id: Principal
}
export interface Archives {
  archives: Array<Archive>
}
export interface Block {
  transaction: Transaction
  timestamp: TimeStamp
  parent_hash: [] | [Uint8Array]
}
export type BlockIndex = bigint
export interface BlockRange {
  blocks: Array<Block>
}
export interface GetBlocksArgs {
  start: BlockIndex
  length: bigint
}
export type Memo = bigint
export type Operation =
  | {
      Burn: { from: AccountIdentifier; amount: Tokens }
    }
  | { Mint: { to: AccountIdentifier; amount: Tokens } }
  | {
      Transfer: {
        to: AccountIdentifier
        fee: Tokens
        from: AccountIdentifier
        amount: Tokens
      }
    }
export type QueryArchiveError =
  | {
      BadFirstBlockIndex: {
        requested_index: BlockIndex
        first_valid_index: BlockIndex
      }
    }
  | { Other: { error_message: string; error_code: bigint } }
export type QueryArchiveFn = ActorMethod<[GetBlocksArgs], QueryArchiveResult>
export type QueryArchiveResult = { Ok: BlockRange } | { Err: QueryArchiveError }
export interface QueryBlocksResponse {
  certificate: [] | [Uint8Array]
  blocks: Array<Block>
  chain_length: bigint
  first_block_index: BlockIndex
  archived_blocks: Array<{
    callback: QueryArchiveFn
    start: BlockIndex
    length: bigint
  }>
}
export type SubAccount = Uint8Array
export interface TimeStamp {
  timestamp_nanos: bigint
}
export interface Tokens {
  e8s: bigint
}
export interface Transaction {
  memo: Memo
  operation: [] | [Operation]
  created_at_time: TimeStamp
}
export interface TransferArgs {
  to: AccountIdentifier
  fee: Tokens
  memo: Memo
  from_subaccount: [] | [SubAccount]
  created_at_time: [] | [TimeStamp]
  amount: Tokens
}
export type TransferError =
  | {
      TxTooOld: { allowed_window_nanos: bigint }
    }
  | { BadFee: { expected_fee: Tokens } }
  | { TxDuplicate: { duplicate_of: BlockIndex } }
  | { TxCreatedInFuture: null }
  | { InsufficientFunds: { balance: Tokens } }
export interface TransferFee {
  transfer_fee: Tokens
}
export type TransferFeeArg = {}
export type TransferResult = { Ok: BlockIndex } | { Err: TransferError }
export interface _SERVICE {
  account_balance: ActorMethod<[AccountBalanceArgs], Tokens>
  archives: ActorMethod<[], Archives>
  decimals: ActorMethod<[], { decimals: number }>
  name: ActorMethod<[], { name: string }>
  query_blocks: ActorMethod<[GetBlocksArgs], QueryBlocksResponse>
  symbol: ActorMethod<[], { symbol: string }>
  transfer: ActorMethod<[TransferArgs], TransferResult>
  transfer_fee: ActorMethod<[TransferFeeArg], TransferFee>
}

export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Address = IDL.Vec(IDL.Nat8)
  const AccountBalanceArgs = IDL.Record({ account: Address })
  const ICP = IDL.Record({ e8s: IDL.Nat64 })
  const Memo = IDL.Nat64
  const SubAccount = IDL.Vec(IDL.Nat8)
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 })
  const TransferArgs = IDL.Record({
    to: Address,
    fee: ICP,
    memo: Memo,
    from_subaccount: IDL.Opt(SubAccount),
    created_at_time: IDL.Opt(TimeStamp),
    amount: ICP
  })
  const BlockIndex = IDL.Nat64
  const TransferError = IDL.Variant({
    TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
    BadFee: IDL.Record({ expected_fee: ICP }),
    TxDuplicate: IDL.Record({ duplicate_of: BlockIndex }),
    TxCreatedInFuture: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: ICP })
  })
  const TransferResult = IDL.Variant({
    Ok: BlockIndex,
    Err: TransferError
  })
  return IDL.Service({
    account_balance: IDL.Func([AccountBalanceArgs], [ICP], ['query']),
    transfer: IDL.Func([TransferArgs], [TransferResult], [])
  })
}
