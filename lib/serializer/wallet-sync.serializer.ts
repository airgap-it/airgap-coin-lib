import { toBuffer } from './utils/toBuffer'

export class WalletSerializer {
  public serialize(syncWalletRequest: SyncWalletRequest): SerializedSyncProtocolWalletSync {
    const toSerialize: any[] = []

    toSerialize[SyncProtocolWalletSync.PUBLIC_KEY] = syncWalletRequest.publicKey
    toSerialize[SyncProtocolWalletSync.DERIVATION_PATH] = syncWalletRequest.derivationPath
    toSerialize[SyncProtocolWalletSync.IS_EXTENDED_PUBLIC_KEY] = syncWalletRequest.isExtendedPublicKey

    const serializedBuffer: SerializedSyncProtocolWalletSync = toBuffer(toSerialize)

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

export interface SyncWalletRequest {
  publicKey: string
  derivationPath: string
  isExtendedPublicKey: boolean
}

export enum SyncProtocolWalletSync {
  PUBLIC_KEY,
  DERIVATION_PATH,
  IS_EXTENDED_PUBLIC_KEY
}

export interface SerializedSyncProtocolWalletSync extends Array<Buffer> {
  [SyncProtocolWalletSync.PUBLIC_KEY]: Buffer
  [SyncProtocolWalletSync.DERIVATION_PATH]: Buffer
  [SyncProtocolWalletSync.IS_EXTENDED_PUBLIC_KEY]: Buffer
}
