import * as bs58check from '../dependencies/src/bs58check-2.1.2/index'
import * as rlp from '../dependencies/src/rlp-2.2.3/index'

import { signedTransactionSerializerByProtocolIdentifier, unsignedTransactionSerializerByProtocolIdentifier } from '.'
import { SERIALIZER_VERSION } from './constants'
import { SerializerVersionMismatch, TypeNotSupported } from './errors'
import { MessageSignRequestSerializer, SerializedSyncProtocolSignMessageRequest, SignMessageRequest } from './sign-request.serializer'
import { MessageSignResponseSerializer, SerializedSyncProtocolSignMessageResponse, SignMessageResponse } from './sign-response.serializer'
import { SerializedSyncProtocolSignedTransaction, SignedTransaction } from './signed-transaction.serializer'
import { SerializedSyncProtocolTransaction, UnsignedTransaction } from './unsigned-transaction.serializer'
import { toBuffer } from './utils/toBuffer'
import { SerializedSyncProtocolWalletSync, SyncWalletRequest, WalletSerializer } from './wallet-sync.serializer'

export enum SyncProtocolKeys {
  VERSION,
  TYPE,
  PROTOCOL,
  PAYLOAD
}

export enum EncodedType {
  UNSIGNED_TRANSACTION = 0,
  SIGNED_TRANSACTION = 1,
  WALLET_SYNC = 2,
  MESSAGE_SIGN_REQUEST = 3,
  MESSAGE_SIGN_RESPONSE = 4
}

export type SerializedSyncProtocolPayload =
  | SerializedSyncProtocolTransaction
  | SerializedSyncProtocolWalletSync
  | SerializedSyncProtocolSignedTransaction
  | SerializedSyncProtocolSignMessageRequest
  | SerializedSyncProtocolSignMessageResponse

export interface SerializedSyncProtocol extends Array<Buffer | SerializedSyncProtocolPayload> {
  [0]: Buffer // SyncProtocolKeys.VERSION
  [1]: Buffer // SyncProtocolKeys.TYPE
  [2]: Buffer // SyncProtocolKeys.PROTOCOL
  [3]: SerializedSyncProtocolPayload // SyncProtocolKeys.PAYLOAD
}

export interface DeserializedSyncProtocol {
  version?: number
  type: EncodedType
  protocol: string
  payload: UnsignedTransaction | SyncWalletRequest | SignedTransaction | SignMessageRequest | SignMessageResponse
}

const assertNever: (x: never) => undefined = (x: never): undefined => undefined

export class SyncProtocolUtils {
  public async serialize(deserializedSyncProtocol: DeserializedSyncProtocol): Promise<string> {
    const version = toBuffer(SERIALIZER_VERSION)
    const type = toBuffer(deserializedSyncProtocol.type.toString())
    const protocol = toBuffer(deserializedSyncProtocol.protocol)
    const typedPayload = deserializedSyncProtocol.payload

    let untypedPayload

    switch (deserializedSyncProtocol.type) {
      case EncodedType.UNSIGNED_TRANSACTION:
        untypedPayload = await unsignedTransactionSerializerByProtocolIdentifier(deserializedSyncProtocol.protocol).serialize(
          typedPayload as UnsignedTransaction
        )
        break
      case EncodedType.SIGNED_TRANSACTION:
        untypedPayload = await signedTransactionSerializerByProtocolIdentifier(deserializedSyncProtocol.protocol).serialize(
          typedPayload as SignedTransaction
        )
        break
      case EncodedType.WALLET_SYNC:
        untypedPayload = new WalletSerializer().serialize(typedPayload as SyncWalletRequest)
        break
      case EncodedType.MESSAGE_SIGN_REQUEST:
        untypedPayload = new MessageSignRequestSerializer().serialize(typedPayload as SignMessageRequest)
        break
      case EncodedType.MESSAGE_SIGN_RESPONSE:
        untypedPayload = new MessageSignResponseSerializer().serialize(typedPayload as SignMessageResponse)
        break
      default:
        assertNever(deserializedSyncProtocol.type)
        throw new TypeNotSupported()
    }

    const toRlpEncode: any[] = []

    toRlpEncode[SyncProtocolKeys.VERSION] = version
    toRlpEncode[SyncProtocolKeys.TYPE] = type
    toRlpEncode[SyncProtocolKeys.PROTOCOL] = protocol
    toRlpEncode[SyncProtocolKeys.PAYLOAD] = untypedPayload

    const rlpEncoded = rlp.encode(toRlpEncode)

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return bs58check.encode(rlpEncoded)
  }

  public async deserialize(serializedSyncProtocol: string): Promise<DeserializedSyncProtocol> {
    const base58Decoded = bs58check.decode(serializedSyncProtocol)
    const rlpDecodedTx: SerializedSyncProtocol = (rlp.decode(base58Decoded as any, false) as {}) as SerializedSyncProtocol

    const version = parseInt(rlpDecodedTx[SyncProtocolKeys.VERSION].toString(), 10)

    if (version !== SERIALIZER_VERSION) {
      throw new SerializerVersionMismatch()
    }

    const type = parseInt(rlpDecodedTx[SyncProtocolKeys.TYPE].toString(), 10)
    const protocol = rlpDecodedTx[SyncProtocolKeys.PROTOCOL].toString()
    const payload = rlpDecodedTx[SyncProtocolKeys.PAYLOAD]

    let typedPayload

    switch (type) {
      case EncodedType.UNSIGNED_TRANSACTION:
        typedPayload = await unsignedTransactionSerializerByProtocolIdentifier(protocol).deserialize(
          payload as SerializedSyncProtocolTransaction
        )
        break
      case EncodedType.SIGNED_TRANSACTION:
        typedPayload = await signedTransactionSerializerByProtocolIdentifier(protocol).deserialize(
          payload as SerializedSyncProtocolSignedTransaction
        )
        break
      case EncodedType.WALLET_SYNC:
        typedPayload = new WalletSerializer().deserialize(payload as SerializedSyncProtocolWalletSync)
        break
      case EncodedType.MESSAGE_SIGN_REQUEST:
        typedPayload = new MessageSignRequestSerializer().deserialize(payload as SerializedSyncProtocolSignMessageRequest)
        break
      case EncodedType.MESSAGE_SIGN_RESPONSE:
        typedPayload = new MessageSignResponseSerializer().deserialize(payload as SerializedSyncProtocolSignMessageResponse)
        break
      default:
        // TODO: Find way to handle this: assertNever(type)
        throw new TypeNotSupported()
    }

    return {
      version,
      type,
      protocol,
      payload: typedPayload
    }
  }
}
