import { AirGapOfflineExtendedProtocol, AirGapOfflineProtocol } from '@airgap/module-kit'

import { AirGapWallet, SerializedAirGapWallet } from '../AirGapWallet'

export interface SerializedAirGapOfflineWallet extends SerializedAirGapWallet {}

export class AirGapOfflineWallet<
  T extends AirGapOfflineProtocol | AirGapOfflineExtendedProtocol = AirGapOfflineProtocol | AirGapOfflineExtendedProtocol
> extends AirGapWallet<AirGapOfflineProtocol, AirGapOfflineExtendedProtocol, T> {
  public toJSON(): Promise<SerializedAirGapOfflineWallet> {
    return super.toJSON()
  }
}
