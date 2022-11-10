import Long from 'long'
import _m0 from 'protobufjs/minimal.js'
import * as base64js from 'base64-js'

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined
type KeysOfUnion<T> = T extends T ? keyof T : never
type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Long
  ? string | number | Long
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>

type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<Exclude<keyof I, KeysOfUnion<P>>, never>

interface TxRaw {
  /**
   * body_bytes is a protobuf serialization of a TxBody that matches the
   * representation in SignDoc.
   */
  bodyBytes: Uint8Array
  /**
   * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
   * representation in SignDoc.
   */
  authInfoBytes: Uint8Array
  /**
   * signatures is a list of signatures that matches the length and order of
   * AuthInfo's signer_infos to allow connecting prepareTxRaw meta information like
   * public key and signing mode by position.
   */
  signatures: Uint8Array[]
}

interface TxBody {
  /**
   * messages is a list of messages to be executed. The required signers of
   * those messages define the number and order of elements in AuthInfo's
   * signer_infos and Tx's signatures. Each required signer address is added to
   * the list only the first time it occurs.
   * By convention, the first required signer (usually from the first message)
   * is referred to as the primary signer and pays the fee for the whole
   * transaction.
   */
  messages: Any[]
  /**
   * memo is any arbitrary note/comment to be added to the transaction.
   * WARNING: in clients, any publicly exposed text should not be called memo,
   * but should be called `note` instead (see https://github.com/cosmos/cosmos-sdk/issues/9122).
   */
  memo: string
  /**
   * timeout is the block height after which this transaction will not
   * be processed by the chain
   */
  timeoutHeight: Long
  /**
   * extension_options are arbitrary options that can be added by chains
   * when the default options are not sufficient. If any of these are present
   * and can't be handled, the transaction will be rejected
   */
  extensionOptions: Any[]
  /**
   * extension_options are arbitrary options that can be added by chains
   * when the default options are not sufficient. If any of these are present
   * and can't be handled, they will be ignored
   */
  nonCriticalExtensionOptions: Any[]
}

interface Any {
  /**
   * A URL/resource name that uniquely identifies the type of the serialized
   * protocol buffer message. This string must contain at least
   * one "/" character. The last segment of the URL's path must represent
   * the fully qualified name of the type (as in
   * `path/google.protobuf.Duration`). The name should be in a canonical form
   * (e.g., leading "." is not accepted).
   *
   * In practice, teams usually precompile into the binary all types that they
   * expect it to use in the context of Any. However, for URLs which use the
   * scheme `http`, `https`, or no scheme, one can optionally set up a type
   * server that maps type URLs to message definitions as follows:
   *
   * * If no scheme is provided, `https` is assumed.
   * * An HTTP GET on the URL must yield a [google.protobuf.Type][]
   *   value in binary format, or produce an error.
   * * Applications are allowed to cache lookup results based on the
   *   URL, or have them precompiled into a binary to avoid any
   *   lookup. Therefore, binary compatibility needs to be preserved
   *   on changes to types. (Use versioned type names to manage
   *   breaking changes.)
   *
   * Note: this functionality is not currently available in the official
   * protobuf release, and it is not used for type URLs beginning with
   * type.googleapis.com.
   *
   * Schemes other than `http`, `https` (or the empty scheme) might be
   * used with implementation specific semantics.
   */
  typeUrl: string
  /** Must be a valid serialized protocol buffer of the above specified type. */
  value: Uint8Array
}

interface ModeInfo_Single {
  /** mode is the signing mode of the single signer */
  mode: number
}

interface ModeInfo {
  /** single represents a single signer */
  single?: ModeInfo_Single | undefined
}

interface Coin {
  denom: string
  amount: string
}

export interface EncodeObject {
  readonly typeUrl: string
  readonly value: any
}

interface MsgSend {
  fromAddress: string
  toAddress: string
  amount: Coin[]
}

interface MsgUndelegate {
  delegatorAddress: string
  validatorAddress: string
  amount?: Coin
}

interface MsgDelegate {
  delegatorAddress: string
  validatorAddress: string
  amount?: Coin
}

interface MsgRedelegate {
  delegatorAddress: string
  validatorSrcAddress: string
  validatorDestAddress: string
  amount?: Coin
}

interface MsgWithdrawDelegatorReward {
  delegatorAddress: string
  validatorAddress: string
}

interface StdFee {
  readonly amount: readonly Coin[]
  readonly gas: string
}

interface TxBodyValue {
  readonly messages: readonly EncodeObject[]
  readonly memo?: string
  readonly timeoutHeight?: Long
  readonly extensionOptions?: Any[]
  readonly nonCriticalExtensionOptions?: Any[]
}

interface TsProtoGeneratedType {
  readonly encode: (message: any | { [k: string]: any }, writer?: protobuf.Writer) => protobuf.Writer
  readonly decode: (input: Uint8Array | protobuf.Reader, length?: number) => any
  readonly fromJSON: (object: any) => any
  readonly fromPartial: (object: any) => any
  readonly toJSON: (message: any | { [k: string]: any }) => unknown
}

/**
 * A type generated by [protobufjs](https://github.com/protobufjs/protobuf.js).
 *
 * This can be used if you want to create types at runtime using pure JavaScript.
 * See https://gist.github.com/fadeev/a4981eff1cf3a805ef10e25313d5f2b7
 */
interface PbjsGeneratedType {
  readonly create: (properties?: { [k: string]: any }) => any
  readonly encode: (message: any | { [k: string]: any }, writer?: protobuf.Writer) => protobuf.Writer
  readonly decode: (reader: protobuf.Reader | Uint8Array, length?: number) => any
}

type GeneratedType = TsProtoGeneratedType | PbjsGeneratedType

function isTsProtoGeneratedType(type: GeneratedType): type is TsProtoGeneratedType {
  return typeof (type as TsProtoGeneratedType).fromPartial === 'function'
}

interface TxBodyEncodeObject extends EncodeObject {
  readonly typeUrl: '/cosmos.tx.v1beta1.TxBody'
  readonly value: TxBodyValue
}
interface Pubkey {
  // type is one of the strings defined in pubkeyType
  // I don't use a string literal union here as that makes trouble with json test data:
  // https://github.com/cosmos/cosmjs/pull/44#pullrequestreview-353280504
  readonly type: string
  readonly value: any
}

interface UPubKey {
  key: Uint8Array
}

interface StdSignature {
  readonly pub_key: Pubkey
  readonly signature: string
}
interface Fee {
  /** amount is the amount of coins to be paid as a fee */
  amount: Coin[]
  /**
   * gas_limit is the maximum gas that can be used in transaction processing
   * before an out of gas error occurs
   */
  gasLimit: Long
  /**
   * if unset, the first signer is responsible for paying the fees. If set, the specified account must pay the fees.
   * the payer must be a tx signer (and thus have signed this field in AuthInfo).
   * setting this field does *not* change the ordering of required signers for the transaction.
   */
  payer: string
  /**
   * if set, the fee payer (either the first signer or the value of the payer field) requests that a fee grant be used
   * to pay fees instead of the fee payer's own balance. If an appropriate fee grant does not exist or the chain does
   * not support fee grants, this will fail
   */
  granter: string
}

interface SignerInfo {
  /**
   * public_key is the public key of the signer. It is optional for accounts
   * that already exist in state. If unset, the verifier can use the required \
   * signer address for this position and lookup the public key.
   */
  publicKey?: Any
  /**
   * mode_info describes the signing mode of the signer and is a nested
   * structure to support nested multisig pubKey's
   */
  modeInfo?: ModeInfo
  /**
   * sequence is the sequence of the account, which describes the
   * number of committed transactions signed by a given address. It is used to
   * prevent replay attacks.
   */
  sequence: Long
}

interface AuthInfo {
  /**
   * signer_infos defines the signing modes for the required signers. The number
   * and order of elements must match the required signers from TxBody's
   * messages. The first element is the primary signer and the one which pays
   * the fee.
   */
  signerInfos: SignerInfo[]
  /**
   * Fee is the fee and gas limit for the transaction. The first signer is the
   * primary signer and the one which pays the fee. The fee can be calculated
   * based on the cost of evaluating the body and doing prepareTxRaw verification
   * of the signers. This can be estimated via simulation.
   */
  fee?: Fee
}

interface SignDoc {
  /**
   * body_bytes is protobuf serialization of a TxBody that matches the
   * representation in TxRaw.
   */
  bodyBytes: Uint8Array
  /**
   * auth_info_bytes is a protobuf serialization of an AuthInfo that matches the
   * representation in TxRaw.
   */
  authInfoBytes: Uint8Array
  /**
   * chain_id is the unique identifier of the chain this transaction targets.
   * It prevents signed transactions from being used on another chain by an
   * attacker
   */
  chainId: string
  /** account_number is the account number of the account in state */
  accountNumber: Long
}

const MsgSend = {
  encode(message: MsgSend, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.fromAddress !== '') {
      writer.uint32(10).string(message.fromAddress)
    }
    if (message.toAddress !== '') {
      writer.uint32(18).string(message.toAddress)
    }
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSend {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgSend } as MsgSend
    message.amount = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.fromAddress = reader.string()
          break
        case 2:
          message.toAddress = reader.string()
          break
        case 3:
          message.amount.push(Coin.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgSend {
    const message = { ...baseMsgSend } as MsgSend
    message.fromAddress = object.fromAddress !== undefined && object.fromAddress !== null ? String(object.fromAddress) : ''
    message.toAddress = object.toAddress !== undefined && object.toAddress !== null ? String(object.toAddress) : ''
    message.amount = (object.amount ?? []).map((e: any) => Coin.fromJSON(e))
    return message
  },

  toJSON(message: MsgSend): unknown {
    const obj: any = {}
    message.fromAddress !== undefined && (obj.fromAddress = message.fromAddress)
    message.toAddress !== undefined && (obj.toAddress = message.toAddress)
    if (message.amount) {
      obj.amount = message.amount.map((e) => (e ? Coin.toJSON(e) : undefined))
    } else {
      obj.amount = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MsgSend>, I>>(object: I): MsgSend {
    const message = { ...baseMsgSend } as MsgSend
    message.fromAddress = object.fromAddress ?? ''
    message.toAddress = object.toAddress ?? ''
    message.amount = object.amount?.map((e) => Coin.fromPartial(e)) || []
    return message
  }
}

const MsgWithdrawDelegatorReward = {
  encode(message: MsgWithdrawDelegatorReward, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress)
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWithdrawDelegatorReward {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgWithdrawDelegatorReward } as MsgWithdrawDelegatorReward
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string()
          break
        case 2:
          message.validatorAddress = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgWithdrawDelegatorReward {
    const message = { ...baseMsgWithdrawDelegatorReward } as MsgWithdrawDelegatorReward
    message.delegatorAddress =
      object.delegatorAddress !== undefined && object.delegatorAddress !== null ? String(object.delegatorAddress) : ''
    message.validatorAddress =
      object.validatorAddress !== undefined && object.validatorAddress !== null ? String(object.validatorAddress) : ''
    return message
  },

  toJSON(message: MsgWithdrawDelegatorReward): unknown {
    const obj: any = {}
    message.delegatorAddress !== undefined && (obj.delegatorAddress = message.delegatorAddress)
    message.validatorAddress !== undefined && (obj.validatorAddress = message.validatorAddress)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MsgWithdrawDelegatorReward>, I>>(object: I): MsgWithdrawDelegatorReward {
    const message = { ...baseMsgWithdrawDelegatorReward } as MsgWithdrawDelegatorReward
    message.delegatorAddress = object.delegatorAddress ?? ''
    message.validatorAddress = object.validatorAddress ?? ''
    return message
  }
}

const baseSignDoc: object = { chainId: '', accountNumber: Long.UZERO }

const SignDoc = {
  encode(message: SignDoc, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bodyBytes.length !== 0) {
      writer.uint32(10).bytes(message.bodyBytes)
    }
    if (message.authInfoBytes.length !== 0) {
      writer.uint32(18).bytes(message.authInfoBytes)
    }
    if (message.chainId !== '') {
      writer.uint32(26).string(message.chainId)
    }
    if (!message.accountNumber.isZero()) {
      writer.uint32(32).uint64(message.accountNumber)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SignDoc {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseSignDoc } as SignDoc
    message.bodyBytes = new Uint8Array()
    message.authInfoBytes = new Uint8Array()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.bodyBytes = reader.bytes()
          break
        case 2:
          message.authInfoBytes = reader.bytes()
          break
        case 3:
          message.chainId = reader.string()
          break
        case 4:
          message.accountNumber = reader.uint64() as Long
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): SignDoc {
    const message = { ...baseSignDoc } as SignDoc
    message.bodyBytes = object.bodyBytes !== undefined && object.bodyBytes !== null ? bytesFromBase64(object.bodyBytes) : new Uint8Array()
    message.authInfoBytes =
      object.authInfoBytes !== undefined && object.authInfoBytes !== null ? bytesFromBase64(object.authInfoBytes) : new Uint8Array()
    message.chainId = object.chainId !== undefined && object.chainId !== null ? String(object.chainId) : ''
    message.accountNumber =
      object.accountNumber !== undefined && object.accountNumber !== null ? Long.fromString(object.accountNumber) : Long.UZERO
    return message
  },

  toJSON(message: SignDoc): unknown {
    const obj: any = {}
    message.bodyBytes !== undefined &&
      (obj.bodyBytes = base64FromBytes(message.bodyBytes !== undefined ? message.bodyBytes : new Uint8Array()))
    message.authInfoBytes !== undefined &&
      (obj.authInfoBytes = base64FromBytes(message.authInfoBytes !== undefined ? message.authInfoBytes : new Uint8Array()))
    message.chainId !== undefined && (obj.chainId = message.chainId)
    message.accountNumber !== undefined && (obj.accountNumber = (message.accountNumber || Long.UZERO).toString())
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<SignDoc>, I>>(object: I): SignDoc {
    const message = { ...baseSignDoc } as SignDoc
    message.bodyBytes = object.bodyBytes ?? new Uint8Array()
    message.authInfoBytes = object.authInfoBytes ?? new Uint8Array()
    message.chainId = object.chainId ?? ''
    message.accountNumber =
      object.accountNumber !== undefined && object.accountNumber !== null ? Long.fromValue(object.accountNumber) : Long.UZERO
    return message
  }
}

const baseMsgUndelegate: object = { delegatorAddress: '', validatorAddress: '' }

const MsgUndelegate = {
  encode(message: MsgUndelegate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress)
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress)
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUndelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgUndelegate } as MsgUndelegate
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string()
          break
        case 2:
          message.validatorAddress = reader.string()
          break
        case 3:
          message.amount = Coin.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgUndelegate {
    const message = { ...baseMsgUndelegate } as MsgUndelegate
    message.delegatorAddress =
      object.delegatorAddress !== undefined && object.delegatorAddress !== null ? String(object.delegatorAddress) : ''
    message.validatorAddress =
      object.validatorAddress !== undefined && object.validatorAddress !== null ? String(object.validatorAddress) : ''
    message.amount = object.amount !== undefined && object.amount !== null ? Coin.fromJSON(object.amount) : undefined
    return message
  },

  toJSON(message: MsgUndelegate): unknown {
    const obj: any = {}
    message.delegatorAddress !== undefined && (obj.delegatorAddress = message.delegatorAddress)
    message.validatorAddress !== undefined && (obj.validatorAddress = message.validatorAddress)
    message.amount !== undefined && (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MsgUndelegate>, I>>(object: I): MsgUndelegate {
    const message = { ...baseMsgUndelegate } as MsgUndelegate
    message.delegatorAddress = object.delegatorAddress ?? ''
    message.validatorAddress = object.validatorAddress ?? ''
    message.amount = object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined
    return message
  }
}

const baseMsgDelegate: object = { delegatorAddress: '', validatorAddress: '' }

const MsgDelegate = {
  encode(message: MsgDelegate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress)
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress)
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgDelegate } as MsgDelegate
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string()
          break
        case 2:
          message.validatorAddress = reader.string()
          break
        case 3:
          message.amount = Coin.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgDelegate {
    const message = { ...baseMsgDelegate } as MsgDelegate
    message.delegatorAddress =
      object.delegatorAddress !== undefined && object.delegatorAddress !== null ? String(object.delegatorAddress) : ''
    message.validatorAddress =
      object.validatorAddress !== undefined && object.validatorAddress !== null ? String(object.validatorAddress) : ''
    message.amount = object.amount !== undefined && object.amount !== null ? Coin.fromJSON(object.amount) : undefined
    return message
  },

  toJSON(message: MsgDelegate): unknown {
    const obj: any = {}
    message.delegatorAddress !== undefined && (obj.delegatorAddress = message.delegatorAddress)
    message.validatorAddress !== undefined && (obj.validatorAddress = message.validatorAddress)
    message.amount !== undefined && (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MsgDelegate>, I>>(object: I): MsgDelegate {
    const message = { ...baseMsgDelegate } as MsgDelegate
    message.delegatorAddress = object.delegatorAddress ?? ''
    message.validatorAddress = object.validatorAddress ?? ''
    message.amount = object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined
    return message
  }
}

const MsgRedelegate = {
  encode(message: MsgRedelegate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress)
    }
    if (message.validatorSrcAddress !== '') {
      writer.uint32(18).string(message.validatorSrcAddress)
    }
    if (message.validatorDestAddress !== '') {
      writer.uint32(18).string(message.validatorDestAddress)
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRedelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseMsgRedelegate } as MsgRedelegate
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string()
          break
        case 2:
          message.validatorSrcAddress = reader.string()
          break
        case 3:
          message.validatorDestAddress = reader.string()
          break
        case 4:
          message.amount = Coin.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MsgRedelegate {
    const message = { ...baseMsgRedelegate } as MsgRedelegate
    message.delegatorAddress =
      object.delegatorAddress !== undefined && object.delegatorAddress !== null ? String(object.delegatorAddress) : ''

    message.validatorSrcAddress =
      object.validatorSrcAddress !== undefined && object.validatorSrcAddress !== null ? String(object.validatorSrcAddress) : ''
    message.validatorDestAddress =
      object.validatorDestAddress !== undefined && object.validatorDestAddress !== null ? String(object.validatorDestAddress) : ''

    message.amount = object.amount !== undefined && object.amount !== null ? Coin.fromJSON(object.amount) : undefined
    return message
  },

  toJSON(message: MsgRedelegate): unknown {
    const obj: any = {}
    message.delegatorAddress !== undefined && (obj.delegatorAddress = message.delegatorAddress)
    message.validatorSrcAddress !== undefined && (obj.validatorSrcAddress = message.validatorSrcAddress)
    message.validatorDestAddress !== undefined && (obj.validatorDestAddress = message.validatorDestAddress)
    message.amount !== undefined && (obj.amount = message.amount ? Coin.toJSON(message.amount) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MsgRedelegate>, I>>(object: I): MsgRedelegate {
    const message = { ...baseMsgRedelegate } as MsgRedelegate
    message.delegatorAddress = object.delegatorAddress ?? ''
    message.validatorSrcAddress = object.validatorSrcAddress ?? ''
    message.validatorDestAddress = object.validatorDestAddress ?? ''
    message.amount = object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined
    return message
  }
}

const defaultRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ['/cosmos.bank.v1beta1.MsgSend', MsgSend],
  ['/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', MsgWithdrawDelegatorReward],
  ['/cosmos.staking.v1beta1.MsgUndelegate', MsgUndelegate],
  ['/cosmos.staking.v1beta1.MsgDelegate', MsgDelegate],
  ['/cosmos.staking.v1beta1.MsgBeginRedelegate', MsgRedelegate]
]

function isTxBodyEncodeObject(encodeObject: EncodeObject): encodeObject is TxBodyEncodeObject {
  return (encodeObject as TxBodyEncodeObject).typeUrl === '/cosmos.tx.v1beta1.TxBody'
}
const lookupType = (typeUrl: string): GeneratedType | undefined => {
  const types = new Map<string, GeneratedType>([...defaultRegistryTypes])
  return types.get(typeUrl)
}

const lookupTypeWithError = (typeUrl: string): GeneratedType => {
  const type = lookupType(typeUrl)
  if (!type) {
    throw new Error(`Unregistered type url: ${typeUrl}`)
  }
  return type
}

const encode = (encodeObject: EncodeObject): Uint8Array => {
  const { value, typeUrl } = encodeObject
  if (isTxBodyEncodeObject(encodeObject)) {
    return encodeTxBody(value)
  }
  const type = lookupTypeWithError(typeUrl)
  const instance = isTsProtoGeneratedType(type) ? type.fromPartial(value) : type.create(value)
  return type.encode(instance).finish()
}

const encodeAsAny = (encodeObject: EncodeObject): Any => {
  const binaryValue = encode(encodeObject)
  return Any.fromPartial({
    typeUrl: encodeObject.typeUrl,
    value: binaryValue
  })
}

const encodeTxBody = (txBodyFields: TxBodyValue): Uint8Array => {
  const wrappedMessages = txBodyFields.messages.map((message) => encodeAsAny(message))
  const txBody = TxBody.fromPartial({
    ...txBodyFields,
    messages: wrappedMessages
  })
  return TxBody.encode(txBody).finish()
}

const PubKey = {
  encode(message: UPubKey, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key.length !== 0) {
      writer.uint32(10).bytes(message.key)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UPubKey {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...basePubKey } as UPubKey
    message.key = new Uint8Array()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.key = reader.bytes()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UPubKey {
    const message = { ...basePubKey } as UPubKey
    message.key = object.key !== undefined && object.key !== null ? bytesFromBase64(object.key) : new Uint8Array()
    return message
  },

  toJSON(message: UPubKey): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = base64FromBytes(message.key !== undefined ? message.key : new Uint8Array()))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UPubKey>, I>>(object: I): UPubKey {
    const message = { ...basePubKey } as UPubKey
    message.key = object.key ?? new Uint8Array()
    return message
  }
}

function toBase64(data: Uint8Array): string {
  return base64js.fromByteArray(data)
}

function fromBase64(base64String: string): Uint8Array {
  if (!base64String.match(/^[a-zA-Z0-9+/]*={0,2}$/)) {
    throw new Error('Invalid base64 string format')
  }
  return base64js.toByteArray(base64String)
}

const encodePubkey = (pubKey: Pubkey): Any => {
  const pubkeyProto = PubKey.fromPartial({
    key: fromBase64(pubKey.value)
  })
  return Any.fromPartial({
    typeUrl: '/cosmos.crypto.secp256k1.PubKey',
    value: Uint8Array.from(PubKey.encode(pubkeyProto).finish())
  })
}

function encodeSecp256k1Pubkey(pubKey: Uint8Array): /** Secp256k1Pubkey */ any {
  if (pubKey.length !== 33 || (pubKey[0] !== 0x02 && pubKey[0] !== 0x03)) {
    throw new Error('Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03')
  }
  return {
    type: 'tendermint/PubKeySecp256k1',
    value: toBase64(pubKey)
  }
}

function signModeToJSON(object: SignMode): string {
  switch (object) {
    case SignMode.SIGN_MODE_UNSPECIFIED:
      return 'SIGN_MODE_UNSPECIFIED'
    case SignMode.SIGN_MODE_DIRECT:
      return 'SIGN_MODE_DIRECT'
    case SignMode.SIGN_MODE_TEXTUAL:
      return 'SIGN_MODE_TEXTUAL'
    case SignMode.SIGN_MODE_LEGACY_AMINO_JSON:
      return 'SIGN_MODE_LEGACY_AMINO_JSON'
    default:
      return 'UNKNOWN'
  }
}

enum SignMode {
  /**
   * SIGN_MODE_UNSPECIFIED - SIGN_MODE_UNSPECIFIED specifies an unknown signing mode and will be
   * rejected
   */
  SIGN_MODE_UNSPECIFIED = 0,
  /**
   * SIGN_MODE_DIRECT - SIGN_MODE_DIRECT specifies a signing mode which uses SignDoc and is
   * verified with raw bytes from Tx
   */
  SIGN_MODE_DIRECT = 1,
  /**
   * SIGN_MODE_TEXTUAL - SIGN_MODE_TEXTUAL is a future signing mode that will verify some
   * human-readable textual representation on top of the binary representation
   * from SIGN_MODE_DIRECT
   */
  SIGN_MODE_TEXTUAL = 2,
  /**
   * SIGN_MODE_LEGACY_AMINO_JSON - SIGN_MODE_LEGACY_AMINO_JSON is a backwards compatibility mode which uses
   * Amino JSON and will be removed in the future
   */
  SIGN_MODE_LEGACY_AMINO_JSON = 127,
  UNRECOGNIZED = -1
}

const signModeFromJSON = (object: any): SignMode => {
  switch (object) {
    case 0:
    case 'SIGN_MODE_UNSPECIFIED':
      return SignMode.SIGN_MODE_UNSPECIFIED
    case 1:
    case 'SIGN_MODE_DIRECT':
      return SignMode.SIGN_MODE_DIRECT
    case 2:
    case 'SIGN_MODE_TEXTUAL':
      return SignMode.SIGN_MODE_TEXTUAL
    case 127:
    case 'SIGN_MODE_LEGACY_AMINO_JSON':
      return SignMode.SIGN_MODE_LEGACY_AMINO_JSON
    case -1:
    case 'UNRECOGNIZED':
    default:
      return SignMode.UNRECOGNIZED
  }
}
class Int53 {
  public static fromString(str: string): Int53 {
    if (!str.match(/^-?[0-9]+$/)) {
      throw new Error('Invalid string format')
    }

    return new Int53(Number.parseInt(str, 10))
  }

  protected readonly data: number

  public constructor(input: number) {
    if (Number.isNaN(input)) {
      throw new Error('Input is not a number')
    }

    if (!Number.isInteger(input)) {
      throw new Error('Input is not an integer')
    }

    if (input < Number.MIN_SAFE_INTEGER || input > Number.MAX_SAFE_INTEGER) {
      throw new Error('Input not in int53 range: ' + input.toString())
    }

    this.data = input
  }

  public toNumber(): number {
    return this.data
  }

  public toString(): string {
    return this.data.toString()
  }
}

const ModeInfo_Single = {
  encode(message: ModeInfo_Single, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.mode !== 0) {
      writer.uint32(8).int32(message.mode)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ModeInfo_Single {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseModeInfo_Single } as ModeInfo_Single
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.mode = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ModeInfo_Single {
    const message = { ...baseModeInfo_Single } as ModeInfo_Single
    message.mode = object.mode !== undefined && object.mode !== null ? signModeFromJSON(object.mode) : 0
    return message
  },

  toJSON(message: ModeInfo_Single): unknown {
    const obj: any = {}
    message.mode !== undefined && (obj.mode = signModeToJSON(message.mode))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ModeInfo_Single>, I>>(object: I): ModeInfo_Single {
    const message = { ...baseModeInfo_Single } as ModeInfo_Single
    message.mode = object.mode ?? 0
    return message
  }
}

const baseMsgWithdrawDelegatorReward: object = { delegatorAddress: '', validatorAddress: '' }
const baseSignerInfo: object = { sequence: Long.UZERO }
const baseFee: object = { gasLimit: Long.UZERO, payer: '', granter: '' }
const baseMsgSend: object = { fromAddress: '', toAddress: '' }
const baseModeInfo_Single: object = { mode: 0 }
const baseTxRaw: object = {}
const basePubKey: object = {}
const baseModeInfo: object = {}
const baseAuthInfo: object = {}
const baseAny: object = { typeUrl: '' }
const baseTxBody: object = { memo: '', timeoutHeight: Long.UZERO }
const baseCoin: object = { denom: '', amount: '' }
const baseMsgRedelegate: object = { delegatorAddress: '', validatorSrcAddress: '', validatorDestAddress: '' }

const ModeInfo = {
  encode(message: ModeInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.single !== undefined) {
      ModeInfo_Single.encode(message.single, writer.uint32(10).fork()).ldelim()
    }

    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ModeInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseModeInfo } as ModeInfo
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.single = ModeInfo_Single.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): ModeInfo {
    const message = { ...baseModeInfo } as ModeInfo
    message.single = object.single !== undefined && object.single !== null ? ModeInfo_Single.fromJSON(object.single) : undefined
    return message
  },

  toJSON(message: ModeInfo): unknown {
    const obj: any = {}
    message.single !== undefined && (obj.single = message.single ? ModeInfo_Single.toJSON(message.single) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<ModeInfo>, I>>(object: I): ModeInfo {
    const message = { ...baseModeInfo } as ModeInfo
    message.single = object.single !== undefined && object.single !== null ? ModeInfo_Single.fromPartial(object.single) : undefined
    return message
  }
}
const SignerInfo = {
  encode(message: SignerInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.publicKey !== undefined) {
      Any.encode(message.publicKey, writer.uint32(10).fork()).ldelim()
    }
    if (message.modeInfo !== undefined) {
      ModeInfo.encode(message.modeInfo, writer.uint32(18).fork()).ldelim()
    }
    if (!message.sequence.isZero()) {
      writer.uint32(24).uint64(message.sequence)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SignerInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseSignerInfo } as SignerInfo
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.publicKey = Any.decode(reader, reader.uint32())
          break
        case 2:
          message.modeInfo = ModeInfo.decode(reader, reader.uint32())
          break
        case 3:
          message.sequence = reader.uint64() as Long
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): SignerInfo {
    const message = { ...baseSignerInfo } as SignerInfo
    message.publicKey = object.publicKey !== undefined && object.publicKey !== null ? Any.fromJSON(object.publicKey) : undefined
    message.modeInfo = object.modeInfo !== undefined && object.modeInfo !== null ? ModeInfo.fromJSON(object.modeInfo) : undefined
    message.sequence = object.sequence !== undefined && object.sequence !== null ? Long.fromString(object.sequence) : Long.UZERO
    return message
  },

  toJSON(message: SignerInfo): unknown {
    const obj: any = {}
    message.publicKey !== undefined && (obj.publicKey = message.publicKey ? Any.toJSON(message.publicKey) : undefined)
    message.modeInfo !== undefined && (obj.modeInfo = message.modeInfo ? ModeInfo.toJSON(message.modeInfo) : undefined)
    message.sequence !== undefined && (obj.sequence = (message.sequence || Long.UZERO).toString())
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<SignerInfo>, I>>(object: I): SignerInfo {
    const message = { ...baseSignerInfo } as SignerInfo
    message.publicKey = object.publicKey !== undefined && object.publicKey !== null ? Any.fromPartial(object.publicKey) : undefined
    message.modeInfo = object.modeInfo !== undefined && object.modeInfo !== null ? ModeInfo.fromPartial(object.modeInfo) : undefined
    message.sequence = object.sequence !== undefined && object.sequence !== null ? Long.fromValue(object.sequence) : Long.UZERO
    return message
  }
}
const Coin = {
  encode(message: Coin, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.denom !== '') {
      writer.uint32(10).string(message.denom)
    }
    if (message.amount !== '') {
      writer.uint32(18).string(message.amount)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Coin {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseCoin } as Coin
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string()
          break
        case 2:
          message.amount = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Coin {
    const message = { ...baseCoin } as Coin
    message.denom = object.denom !== undefined && object.denom !== null ? String(object.denom) : ''
    message.amount = object.amount !== undefined && object.amount !== null ? String(object.amount) : ''
    return message
  },

  toJSON(message: Coin): unknown {
    const obj: any = {}
    message.denom !== undefined && (obj.denom = message.denom)
    message.amount !== undefined && (obj.amount = message.amount)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Coin>, I>>(object: I): Coin {
    const message = { ...baseCoin } as Coin
    message.denom = object.denom ?? ''
    message.amount = object.amount ?? ''
    return message
  }
}
const Fee = {
  encode(message: Fee, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (!message.gasLimit.isZero()) {
      writer.uint32(16).uint64(message.gasLimit)
    }
    if (message.payer !== '') {
      writer.uint32(26).string(message.payer)
    }
    if (message.granter !== '') {
      writer.uint32(34).string(message.granter)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Fee {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseFee } as Fee
    message.amount = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.amount.push(Coin.decode(reader, reader.uint32()))
          break
        case 2:
          message.gasLimit = reader.uint64() as Long
          break
        case 3:
          message.payer = reader.string()
          break
        case 4:
          message.granter = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Fee {
    const message = { ...baseFee } as Fee
    message.amount = (object.amount ?? []).map((e: any) => Coin.fromJSON(e))
    message.gasLimit = object.gasLimit !== undefined && object.gasLimit !== null ? Long.fromString(object.gasLimit) : Long.UZERO
    message.payer = object.payer !== undefined && object.payer !== null ? String(object.payer) : ''
    message.granter = object.granter !== undefined && object.granter !== null ? String(object.granter) : ''
    return message
  },

  toJSON(message: Fee): unknown {
    const obj: any = {}
    if (message.amount) {
      obj.amount = message.amount.map((e) => (e ? Coin.toJSON(e) : undefined))
    } else {
      obj.amount = []
    }
    message.gasLimit !== undefined && (obj.gasLimit = (message.gasLimit || Long.UZERO).toString())
    message.payer !== undefined && (obj.payer = message.payer)
    message.granter !== undefined && (obj.granter = message.granter)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Fee>, I>>(object: I): Fee {
    const message = { ...baseFee } as Fee
    message.amount = object.amount?.map((e) => Coin.fromPartial(e)) || []
    message.gasLimit = object.gasLimit !== undefined && object.gasLimit !== null ? Long.fromValue(object.gasLimit) : Long.UZERO
    message.payer = object.payer ?? ''
    message.granter = object.granter ?? ''
    return message
  }
}
const AuthInfo = {
  encode(message: AuthInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.signerInfos) {
      SignerInfo.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (message.fee !== undefined) {
      Fee.encode(message.fee, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuthInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseAuthInfo } as AuthInfo
    message.signerInfos = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.signerInfos.push(SignerInfo.decode(reader, reader.uint32()))
          break
        case 2:
          message.fee = Fee.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): AuthInfo {
    const message = { ...baseAuthInfo } as AuthInfo
    message.signerInfos = (object.signerInfos ?? []).map((e: any) => SignerInfo.fromJSON(e))
    message.fee = object.fee !== undefined && object.fee !== null ? Fee.fromJSON(object.fee) : undefined
    return message
  },

  toJSON(message: AuthInfo): unknown {
    const obj: any = {}
    if (message.signerInfos) {
      obj.signerInfos = message.signerInfos.map((e) => (e ? SignerInfo.toJSON(e) : undefined))
    } else {
      obj.signerInfos = []
    }
    message.fee !== undefined && (obj.fee = message.fee ? Fee.toJSON(message.fee) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<AuthInfo>, I>>(object: I): AuthInfo {
    const message = { ...baseAuthInfo } as AuthInfo
    message.signerInfos = object.signerInfos?.map((e) => SignerInfo.fromPartial(e)) || []
    message.fee = object.fee !== undefined && object.fee !== null ? Fee.fromPartial(object.fee) : undefined
    return message
  }
}

const Any = {
  encode(message: Any, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.typeUrl !== '') {
      writer.uint32(10).string(message.typeUrl)
    }
    if (message.value.length !== 0) {
      writer.uint32(18).bytes(message.value)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Any {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseAny } as Any
    message.value = new Uint8Array()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.typeUrl = reader.string()
          break
        case 2:
          message.value = reader.bytes()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Any {
    const message = { ...baseAny } as Any
    message.typeUrl = object.typeUrl !== undefined && object.typeUrl !== null ? String(object.typeUrl) : ''
    message.value = object.value !== undefined && object.value !== null ? bytesFromBase64(object.value) : new Uint8Array()
    return message
  },

  toJSON(message: Any): unknown {
    const obj: any = {}
    message.typeUrl !== undefined && (obj.typeUrl = message.typeUrl)
    message.value !== undefined && (obj.value = base64FromBytes(message.value !== undefined ? message.value : new Uint8Array()))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Any>, I>>(object: I): Any {
    const message = { ...baseAny } as Any
    message.typeUrl = object.typeUrl ?? ''
    message.value = object.value ?? new Uint8Array()
    return message
  }
}

const TxBody = {
  encode(message: TxBody, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.messages) {
      Any.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    if (message.memo !== '') {
      writer.uint32(18).string(message.memo)
    }
    if (!message.timeoutHeight.isZero()) {
      writer.uint32(24).uint64(message.timeoutHeight)
    }
    for (const v of message.extensionOptions) {
      Any.encode(v!, writer.uint32(8186).fork()).ldelim()
    }
    for (const v of message.nonCriticalExtensionOptions) {
      Any.encode(v!, writer.uint32(16378).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TxBody {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseTxBody } as TxBody
    message.messages = []
    message.extensionOptions = []
    message.nonCriticalExtensionOptions = []
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.messages.push(Any.decode(reader, reader.uint32()))
          break
        case 2:
          message.memo = reader.string()
          break
        case 3:
          message.timeoutHeight = reader.uint64() as Long
          break
        case 1023:
          message.extensionOptions.push(Any.decode(reader, reader.uint32()))
          break
        case 2047:
          message.nonCriticalExtensionOptions.push(Any.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TxBody {
    const message = { ...baseTxBody } as TxBody
    message.messages = (object.messages ?? []).map((e: any) => Any.fromJSON(e))
    message.memo = object.memo !== undefined && object.memo !== null ? String(object.memo) : ''
    message.timeoutHeight =
      object.timeoutHeight !== undefined && object.timeoutHeight !== null ? Long.fromString(object.timeoutHeight) : Long.UZERO
    message.extensionOptions = (object.extensionOptions ?? []).map((e: any) => Any.fromJSON(e))
    message.nonCriticalExtensionOptions = (object.nonCriticalExtensionOptions ?? []).map((e: any) => Any.fromJSON(e))
    return message
  },

  toJSON(message: TxBody): unknown {
    const obj: any = {}
    if (message.messages) {
      obj.messages = message.messages.map((e) => (e ? Any.toJSON(e) : undefined))
    } else {
      obj.messages = []
    }
    message.memo !== undefined && (obj.memo = message.memo)
    message.timeoutHeight !== undefined && (obj.timeoutHeight = (message.timeoutHeight || Long.UZERO).toString())
    if (message.extensionOptions) {
      obj.extensionOptions = message.extensionOptions.map((e) => (e ? Any.toJSON(e) : undefined))
    } else {
      obj.extensionOptions = []
    }
    if (message.nonCriticalExtensionOptions) {
      obj.nonCriticalExtensionOptions = message.nonCriticalExtensionOptions.map((e) => (e ? Any.toJSON(e) : undefined))
    } else {
      obj.nonCriticalExtensionOptions = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<TxBody>, I>>(object: I): TxBody {
    const message = { ...baseTxBody } as TxBody
    message.messages = object.messages?.map((e) => Any.fromPartial(e)) || []
    message.memo = object.memo ?? ''
    message.timeoutHeight =
      object.timeoutHeight !== undefined && object.timeoutHeight !== null ? Long.fromValue(object.timeoutHeight) : Long.UZERO
    message.extensionOptions = object.extensionOptions?.map((e) => Any.fromPartial(e)) || []
    message.nonCriticalExtensionOptions = object.nonCriticalExtensionOptions?.map((e) => Any.fromPartial(e)) || []
    return message
  }
}

const TxRaw = {
  encode(message: TxRaw, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bodyBytes.length !== 0) {
      writer.uint32(10).bytes(message.bodyBytes)
    }
    if (message.authInfoBytes.length !== 0) {
      writer.uint32(18).bytes(message.authInfoBytes)
    }
    for (const v of message.signatures) {
      writer.uint32(26).bytes(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TxRaw {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = { ...baseTxRaw } as TxRaw
    message.signatures = []
    message.bodyBytes = new Uint8Array()
    message.authInfoBytes = new Uint8Array()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.bodyBytes = reader.bytes()
          break
        case 2:
          message.authInfoBytes = reader.bytes()
          break
        case 3:
          message.signatures.push(reader.bytes())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TxRaw {
    const message = { ...baseTxRaw } as TxRaw
    message.bodyBytes = object.bodyBytes !== undefined && object.bodyBytes !== null ? bytesFromBase64(object.bodyBytes) : new Uint8Array()
    message.authInfoBytes =
      object.authInfoBytes !== undefined && object.authInfoBytes !== null ? bytesFromBase64(object.authInfoBytes) : new Uint8Array()
    message.signatures = (object.signatures ?? []).map((e: any) => bytesFromBase64(e))
    return message
  },

  toJSON(message: TxRaw): unknown {
    const obj: any = {}
    message.bodyBytes !== undefined &&
      (obj.bodyBytes = base64FromBytes(message.bodyBytes !== undefined ? message.bodyBytes : new Uint8Array()))
    message.authInfoBytes !== undefined &&
      (obj.authInfoBytes = base64FromBytes(message.authInfoBytes !== undefined ? message.authInfoBytes : new Uint8Array()))
    if (message.signatures) {
      obj.signatures = message.signatures.map((e) => base64FromBytes(e !== undefined ? e : new Uint8Array()))
    } else {
      obj.signatures = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<TxRaw>, I>>(object: I): TxRaw {
    const message = { ...baseTxRaw } as TxRaw
    message.bodyBytes = object.bodyBytes ?? new Uint8Array()
    message.authInfoBytes = object.authInfoBytes ?? new Uint8Array()
    message.signatures = object.signatures?.map((e) => e) || []
    return message
  }
}

const makeAuthInfoBytes = (
  signers: ReadonlyArray<{ readonly pubKey: Any; readonly sequence: number }>,
  feeAmount: readonly Coin[],
  gasLimit: number,
  signMode = 1
): Uint8Array => {
  const authInfo = {
    signerInfos: makeSignerInfos(signers, signMode),
    fee: {
      amount: [...feeAmount],
      gasLimit: Long.fromNumber(gasLimit)
    }
  }
  return AuthInfo.encode(AuthInfo.fromPartial(authInfo)).finish()
}

const makeSignerInfos = (signers: ReadonlyArray<{ readonly pubKey: Any; readonly sequence: number }>, signMode = 1): SignerInfo[] => {
  return signers.map(
    ({ pubKey, sequence }): SignerInfo => ({
      publicKey: pubKey,
      modeInfo: {
        single: { mode: signMode }
      },
      sequence: Long.fromNumber(sequence)
    })
  )
}

const bytesFromBase64 = (b64: string): Uint8Array => {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i)
  }
  return arr
}

const base64FromBytes = (arr: Uint8Array): string => {
  const bin: string[] = []
  for (const byte of arr as any) {
    bin.push(String.fromCharCode(byte))
  }
  return btoa(bin.join(''))
}

const makeSignDoc = (bodyBytes: Uint8Array, authInfoBytes: Uint8Array, chainId: string, accountNumber: number): SignDoc => {
  return {
    bodyBytes: bodyBytes,
    authInfoBytes: authInfoBytes,
    chainId: chainId,
    accountNumber: Long.fromNumber(accountNumber)
  }
}

const prepareTxRaw = async (
  txBodyEncodeObject: EncodeObject,
  fee: StdFee,
  Uint8pubKey: Uint8Array,
  sequence: number,
  signature: StdSignature,
  chainId: string,
  accountNumber: number
): Promise<TxRaw> => {
  const pubKey = encodePubkey(encodeSecp256k1Pubkey(Uint8pubKey))

  const txBodyBytes = encode(txBodyEncodeObject)

  const gasLimit = Int53.fromString(fee.gas).toNumber()

  const authInfoBytes = makeAuthInfoBytes([{ pubKey, sequence }], fee.amount, gasLimit)
  const signed = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber)
  return TxRaw.fromPartial({
    bodyBytes: signed.bodyBytes,
    authInfoBytes: signed.authInfoBytes,
    signatures: [fromBase64(signature.signature)]
  })
}

export const prepareSignBytes = async (
  txBodyEncodeObject: EncodeObject,
  fee: StdFee,
  pubKey: Uint8Array,
  sequence: number,
  chainId: string,
  accountNumber: number
): Promise<Uint8Array> => {
  const encodedPubKey = encodePubkey(encodeSecp256k1Pubkey(pubKey))

  const txBodyBytes = encode(txBodyEncodeObject)

  const gasLimit = Int53.fromString(fee.gas).toNumber()

  const authInfoBytes = makeAuthInfoBytes([{ pubKey: encodedPubKey, sequence }], fee.amount, gasLimit)
  const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber)

  return makeSignBytes(signDoc)
}

const makeSignBytes = ({ accountNumber, authInfoBytes, bodyBytes, chainId }: SignDoc): Uint8Array => {
  const signDoc = SignDoc.fromPartial({
    accountNumber: accountNumber,
    authInfoBytes: authInfoBytes,
    bodyBytes: bodyBytes,
    chainId: chainId
  })
  return SignDoc.encode(signDoc).finish()
}

export const encodeTxBytes = async (
  txBodyEncodeObject: EncodeObject,
  fee: StdFee,
  pubKey: Uint8Array,
  sequence: number,
  signature: StdSignature,
  chainId: string,
  accountNumber: number
): Promise<Uint8Array> => {
  const txRaw = await prepareTxRaw(txBodyEncodeObject, fee, pubKey, sequence, signature, chainId, accountNumber)
  return TxRaw.encode(txRaw).finish()
}

export const decodeTxBytes = async (bytes: Uint8Array) => {
  const decoded = TxRaw.decode(bytes)
  const body = TxBody.decode(decoded.bodyBytes)
  const authInfo = AuthInfo.decode(decoded.authInfoBytes)
  const messages: EncodeObject[] = body.messages.map((msg) => ({
    typeUrl: msg.typeUrl,
    value: lookupTypeWithError(msg.typeUrl).decode(msg.value)
  }))

  return {
    messages,
    memo: body.memo,
    fee: authInfo.fee,
    signerInfos: authInfo.signerInfos
  }
}
