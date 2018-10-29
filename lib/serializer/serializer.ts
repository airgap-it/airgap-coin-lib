import { IAirGapTransaction } from '../interfaces/IAirGapTransaction'
import { IAirGapWallet } from '../interfaces/IAirGapWallet'
import { SerializedSyncProtocolTransaction, UnsignedTransaction, TransactionSerializer } from './transactions.serializer'
import { SerializedSyncProtocolWalletSync } from './wallet-sync.serializer'
import { EthereumUnsignedTransactionSerializer } from './transactions/ethereum-transactions.serializer'

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
  payload: SerializedSyncProtocolPayload
}

const inflationMap = {
  [EncodedProtocol.ETH]: {
    [EncodedType.UNSIGNED_TRANSACTION]: EthereumUnsignedTransactionSerializer
  }
}

export abstract class Serializer {
  public abstract serialize(...args: any): string
  public abstract deserialize(serializedContent: string): IAirGapTransaction | IAirGapWallet

  protected urlPrefixPerType = {
    [EncodedType.SIGNED_TRANSACTION]: 'airgap-wallet://?d=',
    [EncodedType.UNSIGNED_TRANSACTION]: 'airgap-vault://?d=',
    [EncodedType.WALLET_SYNC]: 'airgap-wallet://?d='
  }

  public toURLScheme(serializedTx: string, transactionType: EncodedType): string {
    return this.urlPrefixPerType[transactionType] + serializedTx
  }

  public fromURLScheme(url: string): IAirGapTransaction | IAirGapWallet {
    const urlScheme = Object.keys(this.urlPrefixPerType).find(type => url.startsWith(this.urlPrefixPerType[type]))
    if (!urlScheme) {
      throw new Error(`No matching URL Schemes found`)
    }

    return this.deserialize(url.slice(url.indexOf(urlScheme)))
  }

  static inflate(serializedContent: SerializedSyncProtocol) {
    const serializer = inflationMap[serializedContent[SyncProtocolKeys.PROTOCOL]][serializedContent[SyncProtocolKeys.TYPE]]

    if (!serializer) {
      throw new Error('no supported serializer found')
    }

    return new serializer()
  }
}
