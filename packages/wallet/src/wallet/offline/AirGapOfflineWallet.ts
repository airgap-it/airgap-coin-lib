import { AirGapOfflineProtocol, Bip32OverridingExtension } from '@airgap/module-kit'

import { AirGapWallet, SerializedAirGapWallet } from '../AirGapWallet'

export interface SerializedAirGapOfflineWallet extends SerializedAirGapWallet {}

export class AirGapOfflineWallet<
  T extends AirGapOfflineProtocol | Bip32OverridingExtension<AirGapOfflineProtocol> =
    | AirGapOfflineProtocol
    | Bip32OverridingExtension<AirGapOfflineProtocol>
> extends AirGapWallet<AirGapOfflineProtocol, T> {
  public toJSON(): Promise<SerializedAirGapOfflineWallet> {
    return super.toJSON()
  }
}
