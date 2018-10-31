import { EncodedType } from './serializer'
import { IAirGapWallet } from '../interfaces/IAirGapWallet'

export abstract class WalletSerializer {
  public abstract serialize(...args: any[]): string
  public abstract deserialize(serializedTx: string): IAirGapWallet
}

export enum SyncProtocolWalletSync {
  PUBLIC_KEY,
  DERIVATION_PATH,
  IS_EXTENDED_PUBLIC_KEY
}

export interface SerializedSyncProtocolWalletSync extends Array<boolean | number | string | EncodedType | string[]> {
  [SyncProtocolWalletSync.PUBLIC_KEY]: string
  [SyncProtocolWalletSync.DERIVATION_PATH]: string
  [SyncProtocolWalletSync.IS_EXTENDED_PUBLIC_KEY]: boolean
}
