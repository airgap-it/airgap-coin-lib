import { SerializedSyncProtocolTransaction, UnsignedTransaction } from './unsigned-transaction.serializer'
import { SerializedSyncProtocolWalletSync, SyncWalletRequest, WalletSerializer } from './wallet-sync.serializer'
import * as rlp from 'rlp'
import { protocolVersion, unsignedTransactionSerializerByProtocolIdentifier, signedTransactionSerializerByProtocolIdentifier } from '.'
import { toBuffer } from './utils/toBuffer'
import * as bs58check from 'bs58check'
import { SignedTransaction, SerializedSyncProtocolSignedTransaction } from './signed-transaction.serializer'

export enum SyncProtocolKeys {
  VERSION,
  TYPE,
  PROTOCOL,
  PAYLOAD
}

export enum EncodedType {
  UNSIGNED_TRANSACTION = 0,
  SIGNED_TRANSACTION = 1,
  WALLET_SYNC = 2
}

export type SerializedSyncProtocolPayload =
  | SerializedSyncProtocolTransaction
  | SerializedSyncProtocolWalletSync
  | SerializedSyncProtocolSignedTransaction

export interface SerializedSyncProtocol extends Array<Buffer | SerializedSyncProtocolPayload> {
  [SyncProtocolKeys.VERSION]: Buffer
  [SyncProtocolKeys.TYPE]: Buffer
  [SyncProtocolKeys.PROTOCOL]: Buffer
  [SyncProtocolKeys.PAYLOAD]: SerializedSyncProtocolPayload
}

export interface DeserializedSyncProtocol {
  version: number
  type: EncodedType
  protocol: string
  payload: UnsignedTransaction | SyncWalletRequest | SignedTransaction
}

export class SyncProtocolUtils {
  public async serialize(deserializedSyncProtocol: DeserializedSyncProtocol): Promise<string> {
    const version = toBuffer(protocolVersion.toString())
    const type = toBuffer(deserializedSyncProtocol.type.toString())
    const protocol = toBuffer(deserializedSyncProtocol.protocol)
    const typedPayload = deserializedSyncProtocol.payload

    let untypedPayload

    switch (deserializedSyncProtocol.type) {
      case EncodedType.UNSIGNED_TRANSACTION:
        untypedPayload = unsignedTransactionSerializerByProtocolIdentifier(protocol).serialize(typedPayload as UnsignedTransaction)
        break
      case EncodedType.SIGNED_TRANSACTION:
        untypedPayload = signedTransactionSerializerByProtocolIdentifier(protocol).serialize(typedPayload as SignedTransaction)
        break
      case EncodedType.WALLET_SYNC:
        untypedPayload = new WalletSerializer().serialize(typedPayload as SyncWalletRequest)
        break
    }

    const rlpEncoded = rlp.encode([version, type, protocol, untypedPayload] as any)

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return bs58check.encode(rlpEncoded)
  }

  public async deserialize(serializedSyncProtocol: string): Promise<DeserializedSyncProtocol> {
    const base58Decoded = bs58check.decode(serializedSyncProtocol)
    const rlpDecodedTx: SerializedSyncProtocol = (rlp.decode(base58Decoded as any) as {}) as SerializedSyncProtocol

    const version = parseInt(rlpDecodedTx[SyncProtocolKeys.VERSION].toString(), 2)
    const type = parseInt(rlpDecodedTx[SyncProtocolKeys.TYPE].toString(), 2)
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
    }

    return {
      version: version,
      type: type,
      protocol: protocol,
      payload: typedPayload
    }
  }
}
