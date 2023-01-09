import { SCALEAccountId, SCALEArray, SCALECompactInt, SCALEDecoder, SCALEInt, SCALETuple } from '@airgap/substrate/v1'

import { PolkadotProtocolConfiguration } from '../../types/configuration'

export class PolkadotStakingLedger<C extends PolkadotProtocolConfiguration = PolkadotProtocolConfiguration> {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): PolkadotStakingLedger<C> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const stash = decoder.decodeNextAccountId()
    const total = decoder.decodeNextCompactInt()
    const active = decoder.decodeNextCompactInt()
    const unlocking = decoder.decodeNextArray((configuration, runtimeVersion, hex) =>
      SCALETuple.decode(
        configuration,
        runtimeVersion,
        hex,
        (_configuration, _runtimeVersion, first) => SCALECompactInt.decode(first),
        (_configuration, _runtimeVersion, second) => SCALECompactInt.decode(second)
      )
    )
    const claimedRewards = decoder.decodeNextArray((_configuration, _runtimeVersion, hex) => SCALEInt.decode(hex, 32))

    return new PolkadotStakingLedger(stash.decoded, total.decoded, active.decoded, unlocking.decoded, claimedRewards.decoded)
  }

  private constructor(
    readonly stash: SCALEAccountId<C>,
    readonly total: SCALECompactInt,
    readonly active: SCALECompactInt,
    readonly unlocking: SCALEArray<SCALETuple<SCALECompactInt, SCALECompactInt>>,
    readonly claimedRewards: SCALEArray<SCALEInt>
  ) {}
}
