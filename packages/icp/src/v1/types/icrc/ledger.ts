export function icrcIDLTypes(IDL) {
  const Value = IDL.Variant({
    Int: IDL.Int,
    Nat: IDL.Nat,
    Blob: IDL.Vec(IDL.Nat8),
    Text: IDL.Text
  })
  const Subaccount = IDL.Vec(IDL.Nat8)
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(Subaccount)
  })
  // @ts-ignore
  const InitArgs = IDL.Record({
    token_symbol: IDL.Text,
    transfer_fee: IDL.Nat64,
    metadata: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
    minting_account: Account,
    initial_balances: IDL.Vec(IDL.Tuple(Account, IDL.Nat64)),
    archive_options: IDL.Record({
      num_blocks_to_archive: IDL.Nat64,
      trigger_threshold: IDL.Nat64,
      max_message_size_bytes: IDL.Opt(IDL.Nat64),
      cycles_for_archive_creation: IDL.Opt(IDL.Nat64),
      node_max_memory_size_bytes: IDL.Opt(IDL.Nat64),
      controller_id: IDL.Principal
    }),
    token_name: IDL.Text
  })
  const Tokens = IDL.Nat
  const Timestamp = IDL.Nat64
  const TransferArg = IDL.Record({
    to: Account,
    fee: IDL.Opt(Tokens),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(Subaccount),
    created_at_time: IDL.Opt(Timestamp),
    amount: Tokens
  })
  const BlockIndex = IDL.Nat
  const TransferError = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat
    }),
    TemporarilyUnavailable: IDL.Null,
    BadBurn: IDL.Record({ min_burn_amount: Tokens }),
    Duplicate: IDL.Record({ duplicate_of: BlockIndex }),
    BadFee: IDL.Record({ expected_fee: Tokens }),
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    TooOld: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: Tokens })
  })
  const TransferResult = IDL.Variant({
    Ok: BlockIndex,
    Err: TransferError
  })

  return {
    Value,
    Subaccount,
    Account,
    InitArgs,
    Tokens,
    Timestamp,
    TransferArg,
    BlockIndex,
    TransferError,
    TransferResult
  }
}

export const icrcIDLFactory = ({ IDL }) => {
  const { Account, Tokens, Value, TransferArg, TransferResult } = icrcIDLTypes(IDL)

  return IDL.Service({
    icrc1_balance_of: IDL.Func([Account], [Tokens], ['query']),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ['query']),
    icrc1_fee: IDL.Func([], [Tokens], ['query']),
    icrc1_metadata: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, Value))], ['query']),
    icrc1_minting_account: IDL.Func([], [IDL.Opt(Account)], ['query']),
    icrc1_name: IDL.Func([], [IDL.Text], ['query']),
    icrc1_supported_standards: IDL.Func([], [IDL.Vec(IDL.Record({ url: IDL.Text, name: IDL.Text }))], ['query']),
    icrc1_symbol: IDL.Func([], [IDL.Text], ['query']),
    icrc1_total_supply: IDL.Func([], [Tokens], ['query']),
    icrc1_transfer: IDL.Func([TransferArg], [TransferResult], [])
  })
}
