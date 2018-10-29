import { IAirGapWallet } from '../interfaces/IAirGapWallet'
import {
  SerializedSyncProtocolTransaction,
  UnsignedTransaction,
  TransactionSerializer,
  serializerByProtocolIdentifier
} from './transactions.serializer'
import { SerializedSyncProtocolWalletSync } from './wallet-sync.serializer'
import * as rlp from 'rlp'

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

export enum EncodedProtocol {
  'ETH',
  'ETH-ERC20'
}

export type SerializedSyncProtocolPayload = SerializedSyncProtocolTransaction | SerializedSyncProtocolWalletSync

export interface SerializedSyncProtocol
  extends Array<boolean | number | UnsignedTransaction | string | EncodedType | string[] | SerializedSyncProtocolPayload> {
  [SyncProtocolKeys.VERSION]: number
  [SyncProtocolKeys.TYPE]: EncodedType
  [SyncProtocolKeys.PROTOCOL]: string
  [SyncProtocolKeys.PAYLOAD]: SerializedSyncProtocolPayload
}

export interface DeserializedSyncProtocol {
  version: number
  type: EncodedType
  protocol: string
  payload: UnsignedTransaction
}

export class SyncProtocolUtils {
  private urlPrefixPerType = {
    [EncodedType.SIGNED_TRANSACTION]: 'airgap-wallet://?d=',
    [EncodedType.UNSIGNED_TRANSACTION]: 'airgap-vault://?d=',
    [EncodedType.WALLET_SYNC]: 'airgap-wallet://?d='
  }

  public async toURLScheme(deserializedSyncProtocol: DeserializedSyncProtocol): Promise<string> {
    const version = deserializedSyncProtocol.version
    const type = deserializedSyncProtocol.type
    const protocol = deserializedSyncProtocol.protocol
    const typedPayload = deserializedSyncProtocol.payload

    let untypedPayload

    switch (type) {
      case EncodedType.UNSIGNED_TRANSACTION:
        untypedPayload = serializerByProtocolIdentifier(protocol).serialize(typedPayload)
    }

    const serializedTx: SerializedSyncProtocol = [version, type, protocol, untypedPayload]

    // as any is necessary due to https://github.com/ethereumjs/rlp/issues/35
    return rlp.encode(serializedTx as any).toString('base64')
  }

  public async fromURLScheme(url: string): Promise<DeserializedSyncProtocol> {
    const urlScheme = Object.keys(this.urlPrefixPerType).find(type => url.startsWith(this.urlPrefixPerType[type]))
    if (!urlScheme) {
      throw new Error(`No matching URL Schemes found`)
    }

    const deserializedTx = url.slice(url.indexOf(urlScheme))
    const base64DecodedBuffer = Buffer.from(deserializedTx, 'base64')
    const rlpDecodedTx: SerializedSyncProtocol = (rlp.decode(base64DecodedBuffer as any) as unknown) as SerializedSyncProtocol

    const type = rlpDecodedTx[SyncProtocolKeys.TYPE]
    const protocol = rlpDecodedTx[SyncProtocolKeys.PROTOCOL]

    let typedPayload

    switch (type) {
      case EncodedType.UNSIGNED_TRANSACTION:
        const payload = rlpDecodedTx[SyncProtocolKeys.PAYLOAD] as SerializedSyncProtocolTransaction
        typedPayload = serializerByProtocolIdentifier(protocol).deserialize(payload)
    }

    return {
      version: rlpDecodedTx[SyncProtocolKeys.VERSION],
      type: type,
      protocol: protocol,
      payload: typedPayload
    }
  }
}

export abstract class Serializer {
  public abstract serialize(...args: any): string
  public abstract deserialize(serializedContent: string): UnsignedTransaction | IAirGapWallet
}
