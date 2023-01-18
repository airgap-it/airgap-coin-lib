import { AirGapOfflineProtocol, Bip32Extension } from '@airgap/module-kit'

import { AirGapWallet, SerializedAirGapWallet } from '../AirGapWallet'

export interface SerializedAirGapOfflineWallet extends SerializedAirGapWallet {}

export class AirGapOfflineWallet<
  T extends AirGapOfflineProtocol | Bip32Extension<AirGapOfflineProtocol> = AirGapOfflineProtocol | Bip32Extension<AirGapOfflineProtocol>
> extends AirGapWallet<AirGapOfflineProtocol, T> {
  public toJSON(): Promise<SerializedAirGapOfflineWallet> {
    return super.toJSON()
  }
}
