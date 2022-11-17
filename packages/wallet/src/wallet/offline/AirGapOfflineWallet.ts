import { AirGapOfflineExtendedProtocol, AirGapOfflineProtocol } from '@airgap/module-kit'

import { AirGapWallet } from '../AirGapWallet'

export class AirGapOfflineWallet<
  T extends AirGapOfflineProtocol | AirGapOfflineExtendedProtocol = AirGapOfflineProtocol | AirGapOfflineExtendedProtocol
> extends AirGapWallet<AirGapOfflineProtocol, AirGapOfflineExtendedProtocol, T> {}
