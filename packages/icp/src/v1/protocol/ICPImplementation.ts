import { Domain, NetworkError } from '@airgap/coinlib-core'
import axios, { AxiosError } from '@airgap/coinlib-core/dependencies/src/axios-0.19.0/index'
import { isHex } from '@airgap/coinlib-core/utils/hex'
import { AirGapTransaction, newAmount } from '@airgap/module-kit'
import 'isomorphic-fetch'
import { sha224, sha256 } from 'js-sha256'

import { ICPProtocolNetwork, ICPUnits } from '../module'
import { KnownNeuron, ListKnownNeuronsResponse, NeuronInfo } from '../types/governance'
import { idlFactory as governanceIdlFactory } from '../types/governance'
import { idlFactory as ledgerIdlFactory, TransferArgs, TransferFn } from '../types/ledger'
import { ICPRequestType } from '../types/transaction'
import { AccountIdentifier, SubAccount } from '../utils/account'
import { Actor } from '../utils/actor'
import { AnonymousIdentity, Identity } from '../utils/auth'
import * as Cbor from '../utils/cbor'
import {
  arrayBufferToHexString,
  asciiStringToByteArray,
  calculateCrc32,
  e8sToTokens,
  hexStringToArrayBuffer,
  hexStringToUint8Array,
  uint8ArrayToBigInt,
  uint8ArrayToHexString
} from '../utils/convert'
import HDKey from '../utils/hdkey'
import {
  CallRequest,
  Endpoint,
  Expiry,
  HttpAgent,
  HttpAgentRequest,
  HttpAgentSubmitRequest,
  QueryRequest,
  ReadRequestType,
  SubmitRequestType,
  TransferRequest
} from '../utils/http'
import * as IDL from '../utils/idl'
import { idlDecodedToJsonStringifiable } from '../utils/json'
import { Principal } from '../utils/principal'
import Secp256k1KeyIdentity from '../utils/secp256k1'

interface Transaction {
  to: string
  amount: bigint
  fee: bigint
  memo?: bigint
  fromSubAccount?: SubAccount
}

// Agent

export function createHttpAgent(rpcUrl: string, identity: Identity = new AnonymousIdentity()): HttpAgent {
  return new HttpAgent({
    identity,
    host: rpcUrl
  })
}

// MNEMONIC -> KEY PAIR
export function getKeyPairFromExtendedSecretKey(extendedSecretKey: string): { publicKey: string; privateKey: string } {
  const hdKey = HDKey.fromExtendedKey(extendedSecretKey)
  const identity = Secp256k1KeyIdentity.fromSecretKey(hdKey.privateKey)

  const publicKey = new Uint8Array(identity.getPublicKey().toDer())
  const privateKey = new Uint8Array(identity.getKeyPair().secretKey)

  return {
    publicKey: uint8ArrayToHexString(publicKey),
    privateKey: uint8ArrayToHexString(privateKey)
  }
}

// PUBLIC KEY -> ADDRESS
export function getPrincipalFromPublicKey(publicKey: string): Principal {
  return Principal.selfAuthenticating(hexStringToUint8Array(publicKey))
}

export function getAddressFromPublicKey(publicKey: string, subAccount?: string | Buffer | Uint8Array): string {
  // Get principal from public key
  const principal = getPrincipalFromPublicKey(publicKey)

  return getAddressFromPrincipal(principal, subAccount)
}

export function getAddressFromPrincipal(principalOrText: Principal | string, subAccountOrUndefined?: string | Buffer | Uint8Array): string {
  const principal =
    typeof principalOrText === 'string'
      ? isHex(principalOrText)
        ? Principal.fromHex(principalOrText)
        : Principal.from(principalOrText)
      : principalOrText

  const subAccount: Uint8Array =
    typeof subAccountOrUndefined === 'string'
      ? Buffer.from(subAccountOrUndefined, 'hex')
      : typeof subAccountOrUndefined === 'undefined' || subAccountOrUndefined.length === 0
      ? Buffer.alloc(32, 0)
      : subAccountOrUndefined

  // Hash (sha224) the principal, the subAccount and some padding
  const padding = asciiStringToByteArray('\x0Aaccount-id')
  const shaObj = sha224.create()
  shaObj.update([...padding, ...principal.toUint8Array(), ...subAccount])
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
    memo: transaction.memo || BigInt(0),
    created_at_time: [],
    from_subaccount: transaction.fromSubAccount ? [transaction.fromSubAccount.toUint8Array()] : []
  }

  // Encode raw request
  //@ts-ignore
  const unsignedTransaction = IDL.encode(TransferFn.argTypes, [rawRequestBody]) as Uint8Array

  return arrayBufferToHexString(unsignedTransaction)
}

// UNSIGNED TRANSACTION -> TRANSACTION DETAILS
export function getInfoFromUnsignedTransaction(
  unsignedTransaction: string
): {
  to: string
  fee: bigint
  memo: bigint
  from_subaccount: string[]
  created_at_time: any[]
  amount: bigint
  json: IDL.JsonValue
} {
  //@ts-ignore
  const transaction = IDL.decode(TransferFn.argTypes, Buffer.from(unsignedTransaction, 'hex'))[0] as any
  return {
    to: uint8ArrayToHexString(transaction.to),
    fee: transaction.fee.e8s,
    memo: transaction.memo,
    from_subaccount: transaction.from_subaccount,
    created_at_time: transaction.created_at_time,
    amount: transaction.amount.e8s,
    json: transaction
  }
}

export function getDetailsFromUnsignedTransactionTransfer(
  unsignedTransaction: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  const transactionDetails = getInfoFromUnsignedTransaction(unsignedTransaction)

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [transactionDetails.to],
      isInbound: false,
      amount: newAmount(transactionDetails.amount.toString(), 'blockchain'),
      fee: newAmount(transactionDetails.fee.toString(), 'blockchain'),
      network,
      json: idlDecodedToJsonStringifiable(transactionDetails.json)
    }
  ]
}

// UNSIGNED TRANSACTION, PRIVATE KEY -> SIGNED TRANSACTION
export async function signTransactionTransfer(unsignedTransaction: string, privateKey: string, canisterId: string): Promise<string> {
  // TODO : REFACTOR
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

  return signTransaction(privateKey, canisterId, args, 'transfer', 'call')
}

export async function signTransaction(
  privateKey: string,
  canisterId: string,
  arg: any,
  methodName: string,
  callType: 'query' | 'call'
): Promise<string> {
  const identity = Secp256k1KeyIdentity.fromSecretKey(hexStringToArrayBuffer(privateKey))

  let submit: any
  if (callType === 'query') {
    submit = {
      request_type: ReadRequestType.Query,
      canister_id: Principal.from(canisterId),
      method_name: methodName,
      arg,
      sender: identity.getPrincipal(),
      ingress_expiry: new Expiry(5 * 60 * 1000)
    } as QueryRequest
  } else {
    submit = {
      request_type: SubmitRequestType.Call,
      canister_id: Principal.from(canisterId),
      method_name: methodName,
      arg,
      sender: identity.getPrincipal(),
      ingress_expiry: new Expiry(5 * 60 * 1000)
    } as CallRequest
  }

  const transform = async (request: HttpAgentRequest): Promise<HttpAgentRequest> => {
    let p = Promise.resolve(request)
    return p
  }

  let request: any
  if (callType === 'query') {
    request = (await transform({
      request: {
        body: null,
        method: 'POST',
        headers: {
          'Content-Type': 'application/cbor'
        }
      },
      endpoint: Endpoint.Query,
      body: submit
    })) as HttpAgentSubmitRequest
  } else {
    request = (await transform({
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
  }

  // Apply transform for identity.
  const transformedRequest = (await identity.transformRequest(request)) as any
  const encoded = Cbor.encode(transformedRequest.body)

  return arrayBufferToHexString(encoded)
}

// SIGNED TRANSACTION -> TRANSACTION DETAILS
export function getDetailsFromSignedTransactionTransfer(
  signedTransaction: string,
  publicKey: string,
  network: ICPProtocolNetwork
): AirGapTransaction<ICPUnits>[] {
  const transactionInfo: any = Cbor.decode(hexStringToArrayBuffer(signedTransaction))
  const args = decodeArguments(TransferArgs, transactionInfo.content.arg)

  return [
    {
      from: [getAddressFromPublicKey(publicKey)],
      to: [uint8ArrayToHexString(args.to)],
      isInbound: false,
      amount: newAmount(args.amount.e8s.toString(), 'blockchain'),
      fee: newAmount(args.fee.e8s.toString(), 'blockchain'),
      network,
      json: idlDecodedToJsonStringifiable(args)
    }
  ]
}

export function decodeArguments(idlInterface: any, args: ArrayBuffer): any {
  return IDL.decode([idlInterface], args)[0]
}

// ADDRESS -> BALANCE
export async function getBalanceFromAddress(address: string, host: string, canisterId: string): Promise<bigint> {
  const agent = createHttpAgent(host, Secp256k1KeyIdentity.generate())

  const actor = Actor.createActor(ledgerIdlFactory, {
    agent,
    canisterId
  })

  let acc = Uint8Array.from(Buffer.from(address, 'hex'))
  const b = (await actor.account_balance({
    account: [...acc]
  })) as { e8s: bigint }
  return b.e8s
}

export async function broadcastTransaction(
  signedTransaction: string,
  host: string,
  canisterId: string,
  requestType: ICPRequestType
): Promise<ArrayBuffer> {
  const canister = Principal.from(canisterId)
  const body = hexStringToArrayBuffer(signedTransaction)

  try {
    const response = await axios.post('' + new URL(`/api/v2/canister/${canister.toText()}/${requestType}`, host), body, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/cbor'
      }
    })

    return response.data
  } catch (error: any) {
    console.error(error)
    throw new NetworkError(Domain.ICP, error as AxiosError)
  }
}

// STAKING

export function getFixedSubaccountFromPrivateKey(privateKey: string): { subAccount: SubAccount; nonce: bigint } {
  const identity = Secp256k1KeyIdentity.fromSecretKey(Buffer.from(privateKey, 'hex'))
  const publicKey = Buffer.from(identity.getPublicKey().toDer())

  return getFixedSubaccountFromPublicKey(publicKey.toString('hex'))
}

export function getFixedSubaccountFromPublicKey(publicKey: string): { subAccount: SubAccount; nonce: bigint } {
  // Create subaccount from publicKey
  const principal = getPrincipalFromPublicKey(publicKey)
  const padding = asciiStringToByteArray('neuron-stake')
  const shaObj = sha256.create()

  // Should be random?
  //const nonceBytes = new Uint8Array(randomBytes(8))

  // TODO: const arr = hexStringToUint8Array(publicKey)
  const arr = principal.toUint8Array()
  const nonceBytes = new Uint8Array(arr.buffer, arr.byteLength - 8)

  const nonce = uint8ArrayToBigInt(nonceBytes)
  shaObj.update([0x0c, ...padding, ...principal.toUint8Array(), ...nonceBytes])
  const toSubAccount = SubAccount.fromBytes(new Uint8Array(shaObj.array())) as SubAccount

  return {
    subAccount: toSubAccount,
    nonce
  }
}

export function createStakeUnsignedTransactions(amount: bigint, fee: bigint, publicKey: string, canisterId: string): string[] {
  const { subAccount, nonce } = getFixedSubaccountFromPublicKey(publicKey)
  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal: Principal.from(canisterId),
    subAccount: subAccount
  })

  // Send amount to the ledger.
  const unsignedTransfer = createUnsignedTransaction({
    memo: nonce,
    amount: amount,
    to: accountIdentifier.toHex(),
    fee: fee
  })

  // Notify the governance of the transaction so that the neuron is created.
  // const unsignedClaim = createClaimOrRefreshNeuronFromAccountUnsignedTransaction(principal, nonce)

  return [unsignedTransfer]
}

export function createClaimOrRefreshNeuronFromAccountUnsignedTransaction(principal: Principal, memo: bigint): string {
  const ClaimOrRefreshNeuronFromAccount = IDL.Record({
    controller: IDL.Opt(IDL.Principal),
    memo: IDL.Nat64
  })

  const unsignedTransaction = IDL.encode([ClaimOrRefreshNeuronFromAccount], [{ controller: [principal], memo: memo }])

  return arrayBufferToHexString(unsignedTransaction)
}

export function createManageNeuronUnsignedTransaction(principal: Principal, memo: bigint): string {
  const NeuronId = IDL.Record({ id: IDL.Nat64 })
  const NeuronIdOrSubaccount = IDL.Variant({
    Subaccount: IDL.Vec(IDL.Nat8),
    NeuronId: NeuronId
  })
  const Follow = IDL.Record({
    topic: IDL.Int32,
    followees: IDL.Vec(NeuronId)
  })
  const Command = IDL.Variant({
    Follow: Follow
  })
  const ManageNeuron = IDL.Record({
    id: IDL.Opt(NeuronId),
    command: IDL.Opt(Command),
    neuron_id_or_subaccount: IDL.Opt(NeuronIdOrSubaccount)
  })

  const unsignedTransaction = IDL.encode([ManageNeuron], [{ controller: [principal], memo: memo }])

  return arrayBufferToHexString(unsignedTransaction)
}

export async function signListNeurons(privateKey: string, canisterId: string): Promise<string> {
  const ListNeurons = IDL.Record({
    neuron_ids: IDL.Vec(IDL.Nat64),
    include_neurons_readable_by_caller: IDL.Bool
  })

  const args = IDL.encode([ListNeurons], [{ neuron_ids: [], include_neurons_readable_by_caller: true }])

  const signedTransaction = signTransaction(privateKey, canisterId, args, 'list_neurons', 'query')
  return signedTransaction
}

export async function listKnownNeurons(host: string, canisterId: string): Promise<KnownNeuron[]> {
  const agent = createHttpAgent(host, Secp256k1KeyIdentity.generate())

  const actor = Actor.createActor(governanceIdlFactory, {
    agent,
    canisterId
  })

  const result = (await actor.list_known_neurons()) as ListKnownNeuronsResponse
  return result.known_neurons
}

export async function getNeuronInfo(neuronId: string, host: string, canisterId: string): Promise<NeuronInfo | undefined> {
  const agent = createHttpAgent(host, Secp256k1KeyIdentity.generate())

  const actor = Actor.createActor(governanceIdlFactory, {
    agent,
    canisterId
  })

  const result = (await actor.get_neuron_info(BigInt(neuronId))) as any

  return result.Ok ? (result.Ok as NeuronInfo) : undefined
}

export async function getNeuronInfoBySubAccount(publicKey: string, host: string, canisterId: string): Promise<NeuronInfo | undefined> {
  // Create subaccount from publicKey
  const { subAccount } = getFixedSubaccountFromPublicKey(publicKey)

  const agent = createHttpAgent(host, Secp256k1KeyIdentity.generate())

  const actor = Actor.createActor(governanceIdlFactory, {
    agent,
    canisterId
  })

  const array = subAccount.toUint8Array()
  const result = (await actor.get_neuron_info_by_id_or_subaccount({ Subaccount: array })) as any

  return result.Ok ? (result.Ok as NeuronInfo) : undefined
}
