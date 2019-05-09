import { toBuffer } from './utils/toBuffer'

export interface SyncWalletRequest {
  publicKey: string
  derivationPath: string
  isExtendedPublicKey: boolean
}

export enum SyncProtocolWalletSync {
  PUBLIC_KEY = 0,
  DERIVATION_PATH = 1,
  IS_EXTENDED_PUBLIC_KEY = 2
}

export interface SerializedSyncProtocolWalletSync extends Array<Buffer> {
  [0]: Buffer // SyncProtocolWalletSync.PUBLIC_KEY
  [1]: Buffer // SyncProtocolWalletSync.DERIVATION_PATH
  [2]: Buffer // SyncProtocolWalletSync.IS_EXTENDED_PUBLIC_KEY
}

export class WalletSerializer {
  public serialize(syncWalletRequest: SyncWalletRequest): SerializedSyncProtocolWalletSync {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolWalletSync.PUBLIC_KEY] = syncWalletRequest.publicKey
    toSerialize[SyncProtocolWalletSync.DERIVATION_PATH] = syncWalletRequest.derivationPath
    toSerialize[SyncProtocolWalletSync.IS_EXTENDED_PUBLIC_KEY] = syncWalletRequest.isExtendedPublicKey

    const serializedBuffer: SerializedSyncProtocolWalletSync = toBuffer(toSerialize) as SerializedSyncProtocolWalletSync

    return serializedBuffer
  }

  public deserialize(serializedWalletRequest: SerializedSyncProtocolWalletSync): SyncWalletRequest {
    const syncWalletRequest: SyncWalletRequest = {
      publicKey: serializedWalletRequest[SyncProtocolWalletSync.PUBLIC_KEY].toString(),
      derivationPath: serializedWalletRequest[SyncProtocolWalletSync.DERIVATION_PATH].toString(),
      isExtendedPublicKey: serializedWalletRequest[SyncProtocolWalletSync.IS_EXTENDED_PUBLIC_KEY].toString() === '0' ? false : true
    }
    return syncWalletRequest
  }
}
