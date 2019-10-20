import * as bs58check from 'bs58check'
import * as rlp from 'rlp'

import { signedTransactionSerializerByProtocolIdentifier, unsignedTransactionSerializerByProtocolIdentifier } from '.'
import { SERIALIZER_VERSION } from './constants'
import { SerializerVersionMismatch, TypeNotSupported } from './errors'
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
  UNSIGNED_TRANSACTION,
  SIGNED_TRANSACTION,
  WALLET_SYNC
}

export type SerializedSyncProtocolPayload =
  | SerializedSyncProtocolTransaction
  | SerializedSyncProtocolWalletSync
  | SerializedSyncProtocolSignedTransaction

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
  payload: UnsignedTransaction | SyncWalletRequest | SignedTransaction
}

export class SyncProtocolUtils {
  public async serialize(deserializedSyncProtocol: DeserializedSyncProtocol): Promise<string> {
    const version = toBuffer(SERIALIZER_VERSION)
    const type = toBuffer(deserializedSyncProtocol.type.toString())
    const protocol = toBuffer(deserializedSyncProtocol.protocol)
    const typedPayload = deserializedSyncProtocol.payload

    let untypedPayload

    switch (deserializedSyncProtocol.type) {
      case EncodedType.UNSIGNED_TRANSACTION:
        untypedPayload = unsignedTransactionSerializerByProtocolIdentifier(deserializedSyncProtocol.protocol).serialize(
          typedPayload as UnsignedTransaction
        )
        break
      case EncodedType.SIGNED_TRANSACTION:
        untypedPayload = signedTransactionSerializerByProtocolIdentifier(deserializedSyncProtocol.protocol).serialize(
          typedPayload as SignedTransaction
        )
        break
      case EncodedType.WALLET_SYNC:
        untypedPayload = new WalletSerializer().serialize(typedPayload as SyncWalletRequest)
        break
      default:
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
    const rlpDecodedTx: SerializedSyncProtocol = (rlp.decode(base58Decoded as any) as {}) as SerializedSyncProtocol

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
        typedPayload = unsignedTransactionSerializerByProtocolIdentifier(protocol).deserialize(payload as SerializedSyncProtocolTransaction)
        break
      case EncodedType.SIGNED_TRANSACTION:
        typedPayload = signedTransactionSerializerByProtocolIdentifier(protocol).deserialize(
          payload as SerializedSyncProtocolSignedTransaction
        )
        break
      case EncodedType.WALLET_SYNC:
        typedPayload = new WalletSerializer().deserialize(payload as SerializedSyncProtocolWalletSync)
        break
      default:
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
