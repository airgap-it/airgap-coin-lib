import 'isomorphic-fetch'

import {
  arrayBufferToHexString,
  asciiStringToByteArray,
  calculateCrc32,
  e8sToTokens,
  hexStringToArrayBuffer,
  hexStringToUint8Array,
  uint8ArrayToHexString
} from '../utils/convert'
import { sha224 } from 'js-sha256'
import { TransferFn, canisterId as ledgerCanisterId, idlFactory as ledgerIdlFactory } from '../types/ledger'
import axios from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import * as IDL from '../utils/idl'
import { Principal } from '../utils/principal'
import Secp256k1KeyIdentity from '../utils/secp256k1'
import {
  CallRequest,
  Endpoint,
  Expiry,
  HttpAgent,
  HttpAgentRequest,
  HttpAgentSubmitRequest,
  SubmitRequestType,
  TransferRequest
} from '../utils/http'
import { AccountIdentifier } from '../utils/account'
// import { requestIdOf } from '../utils/auth'
import { Actor } from '../utils/actor'
import * as Cbor from '../utils/cbor'

interface Transaction {
  to: string
  amount: bigint
  fee: bigint
}

// MNEMONIC -> KEY PAIR
export function getKeyPairFromMnemonic(mnemonic: string, derivationPath?: string): { publicKey: string; privateKey: string } {
  const identity = Secp256k1KeyIdentity.fromSeedPhrase(mnemonic, undefined, derivationPath)

  const publicKey = new Uint8Array(identity.getPublicKey().toDer())
  const privateKey = new Uint8Array(identity.getKeyPair().secretKey)

  return {
    publicKey: uint8ArrayToHexString(publicKey),
    privateKey: uint8ArrayToHexString(privateKey)
  }
}

// PUBLIC KEY -> ADDRESS
export function getAddressFromPublicKey(publicKey: string, subAccount?: Uint8Array): string {
  // Get principal from public key
  const principal = Principal.selfAuthenticating(hexStringToUint8Array(publicKey))

  // Hash (sha224) the principal, the subAccount and some padding
  const padding = asciiStringToByteArray('\x0Aaccount-id')
  const shaObj = sha224.create()
  shaObj.update([...padding, ...principal.toUint8Array(), ...(subAccount ?? Array(32).fill(0))])
  const hash = new Uint8Array(shaObj.array())

  // Prepend the checksum of the hash and convert to a hex string
  const checksum = calculateCrc32(hash)
  const bytes = new Uint8Array([...checksum, ...hash])
  return uint8ArrayToHexString(bytes)
}

// TRANSACTION OBJECT -> UNSIGNED TRANSACTION HEX
export function createUnsignedTransaction(transaction: Transaction): string {
  const to = AccountIdentifier.fromHex(transaction.to)

  // Create raw request body
  const rawRequestBody = {
    to: to.toNumbers(),
    fee: e8sToTokens(transaction.fee),
    amount: e8sToTokens(transaction.amount),
    // Always explicitly set the memo for compatibility with ledger wallet - hardware wallet
    memo: BigInt(0),
    created_at_time: [],
    from_subaccount: []
  }

  // Encode raw request
  //@ts-ignore
  const unsignedTransaction = IDL.encode(TransferFn.argTypes, [rawRequestBody]) as Uint8Array

  return arrayBufferToHexString(unsignedTransaction)
}

// UNSIGNED TRANSACTION -> TRANSACTION DETAILS
export function getInfoFromUnsignedTransaction(unsignedTransaction: string): {
  to: string
  fee: bigint
  memo: bigint
  from_subaccount: string[]
  created_at_time: any[]
  amount: bigint
} {
  //@ts-ignore
  const transaction = IDL.decode(TransferFn.argTypes, Buffer.from(unsignedTransaction, 'hex'))[0] as any
  return {
    to: uint8ArrayToHexString(transaction.to),
    fee: transaction.fee.e8s,
    memo: transaction.memo,
    from_subaccount: transaction.from_subaccount,
    created_at_time: transaction.created_at_time,
    amount: transaction.amount.e8s
  }
}

// UNSIGNED TRANSACTION, PRIVATE KEY -> SIGNED TRANSACTION
export async function signTransaction(unsignedTransaction: string, privateKey: string): Promise<string> {
  // TODO : REFACTOR
  const identity = Secp256k1KeyIdentity.fromSecretKey(hexStringToArrayBuffer(privateKey))
  const transactionDetails = getInfoFromUnsignedTransaction(unsignedTransaction)

  const Address = IDL.Vec(IDL.Nat8)
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

  const DEFAULT_TRANSACTION_FEE = BigInt(10_000)

  const toTransferRawRequest = ({ to, amount, memo, fee, fromSubAccount }: TransferRequest) => {
    return {
      to: to.toNumbers(),
      fee: e8sToTokens(fee ?? DEFAULT_TRANSACTION_FEE),
      amount: e8sToTokens(amount),
      // Always explicitly set the memo for compatibility with ledger wallet - hardware wallet
      memo: memo ?? BigInt(0),
      created_at_time: [],
      from_subaccount: fromSubAccount === undefined ? [] : [fromSubAccount]
    }
  }

  const rawRequestBody = toTransferRawRequest({
    ...transactionDetails,
    to: AccountIdentifier.fromHex(transactionDetails.to)
  })

  const args = IDL.encode([TransferArgs], [rawRequestBody])

  const submit: CallRequest = {
    request_type: SubmitRequestType.Call,
    //@ts-ignore
    canister_id: Principal.from(ledgerCanisterId),
    method_name: 'transfer',
    arg: args,
    //@ts-ignore
    sender: identity.getPrincipal(),
    ingress_expiry: new Expiry(5 * 60 * 1000)
  }

  const transform = async (request: HttpAgentRequest): Promise<HttpAgentRequest> => {
    let p = Promise.resolve(request)
    return p
  }

  const request: any = (await transform({
    request: {
      body: null,
      method: 'POST',
      headers: {
        'Content-Type': 'application/cbor'
      }
    },
    endpoint: Endpoint.Call,
    body: submit
  })) as HttpAgentSubmitRequest

  // Apply transform for identity.
  const transformedRequest = (await identity.transformRequest(request)) as any
  const encoded = Cbor.encode(transformedRequest.body)

  return arrayBufferToHexString(encoded)
}

// SIGNED TRANSACTION -> TRANSACTION DETAILS
export function getInfoFromSignedTransaction(signedTransaction: string): any {
  return Cbor.decode(hexStringToArrayBuffer(signedTransaction))
}

export function decodeArguments(args: ArrayBuffer): any {
  const Address = IDL.Vec(IDL.Nat8)
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

  return IDL.decode([TransferArgs], args)
}

// ADDRESS -> BALANCE
export async function getBalanceFromAddress(address: string, host: string): Promise<bigint> {
  const identity = Secp256k1KeyIdentity.generate()

  const agent = new HttpAgent({
    identity: identity,
    host: host
  })

  const actor = Actor.createActor(ledgerIdlFactory, {
    agent: agent,
    canisterId: ledgerCanisterId
  })

  let acc = Uint8Array.from(Buffer.from(address, 'hex'))
  const b = (await actor.account_balance({
    account: [...acc]
  })) as { e8s: bigint }
  return b.e8s
}

export async function broadcastTransaction(signedTransaction: string, host: string): Promise<string> {
  const canister = Principal.from(ledgerCanisterId)

  const body = hexStringToArrayBuffer(signedTransaction)
  // const signedTransactionInfo = getInfoFromSignedTransaction(signedTransaction)

  try {
    /*const request = */ await axios.post('' + new URL(`/api/v2/canister/${canister.toText()}/call`, host), body, {
      headers: {
        'Content-Type': 'application/cbor'
      }
    })

    // const submit: CallRequest = {
    //   ...signedTransactionInfo.content,
    //   ingress_expiry: new Expiry(1000)
    // }

    // await Promise.all([request, requestIdOf(submit)])

    return ''
  } catch (error: any) {
    console.error('Error: ', error)
    return ''
  }
}
