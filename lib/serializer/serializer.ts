import { SerializedSyncProtocolTransaction, UnsignedTransaction } from './transactions.serializer'
import { SerializedSyncProtocolWalletSync } from './wallet-sync.serializer'
import * as rlp from 'rlp'
import { serializerByProtocolIdentifier, protocolVersion } from '.'
import { toBuffer } from './utils/toBuffer'

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

export type SerializedSyncProtocolPayload = SerializedSyncProtocolTransaction | SerializedSyncProtocolWalletSync

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
  payload: UnsignedTransaction
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
        untypedPayload = serializerByProtocolIdentifier(protocol).serialize(typedPayload)
    }

    const rlpEncoded = rlp.encode([version, type, protocol, untypedPayload] as any)

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return rlpEncoded.toString('base64')
  }

  public async deserialize(serializedSyncProtocol: string): Promise<DeserializedSyncProtocol> {
    const base64DecodedBuffer = Buffer.from(serializedSyncProtocol, 'base64')
    const rlpDecodedTx: SerializedSyncProtocol = (rlp.decode(base64DecodedBuffer as any) as unknown) as SerializedSyncProtocol

    const version = parseInt(rlpDecodedTx[SyncProtocolKeys.VERSION].toString(), 2)
    const type = parseInt(rlpDecodedTx[SyncProtocolKeys.TYPE].toString(), 2)
    const protocol = rlpDecodedTx[SyncProtocolKeys.PROTOCOL].toString()
    const payload = rlpDecodedTx[SyncProtocolKeys.PAYLOAD] as SerializedSyncProtocolTransaction

    let typedPayload

    switch (type) {
      case EncodedType.UNSIGNED_TRANSACTION:
        typedPayload = serializerByProtocolIdentifier(protocol).deserialize(payload)
    }

    return {
      version: version,
      type: type,
      protocol: protocol,
      payload: typedPayload
    }
  }
}
