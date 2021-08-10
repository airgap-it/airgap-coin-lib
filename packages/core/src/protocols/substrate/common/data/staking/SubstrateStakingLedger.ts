import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALETuple } from '../scale/type/SCALETuple'

export class SubstrateStakingLedger<Network extends SubstrateNetwork> {
  public static decode<Network extends SubstrateNetwork>(
    network: Network, 
    runtimeVersion: number | undefined, 
    raw: string
  ): SubstrateStakingLedger<Network> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const stash = decoder.decodeNextAccountId()
    const total = decoder.decodeNextCompactInt()
    const active = decoder.decodeNextCompactInt()
    const unlocking = decoder.decodeNextArray((network, runtimeVersion, hex) =>
      SCALETuple.decode(
        network,
        runtimeVersion,
        hex,
        (_network, _runtimeVersion, first) => SCALECompactInt.decode(first),
        (_network, _runtimeVersion, second) => SCALECompactInt.decode(second)
      )
    )
    const claimedRewards = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEInt.decode(hex, 32))

    return new SubstrateStakingLedger(stash.decoded, total.decoded, active.decoded, unlocking.decoded, claimedRewards.decoded)
  }

  private constructor(
    readonly stash: SCALEAccountId<Network>,
    readonly total: SCALECompactInt,
    readonly active: SCALECompactInt,
    readonly unlocking: SCALEArray<SCALETuple<SCALECompactInt, SCALECompactInt>>,
    readonly claimedRewards: SCALEArray<SCALEInt>
  ) {}
}
