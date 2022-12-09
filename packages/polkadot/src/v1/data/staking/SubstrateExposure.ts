import { SCALEAccountId, SCALEArray, SCALECompactInt, SCALEDecoder, SCALETuple } from '@airgap/substrate/v1'
import { PolkadotProtocolConfiguration } from '../../types/configuration'

export class SubstrateExposure<C extends PolkadotProtocolConfiguration = PolkadotProtocolConfiguration> {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateExposure<C> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const total = decoder.decodeNextCompactInt()
    const own = decoder.decodeNextCompactInt()
    const others = decoder.decodeNextArray((configuration, runtimeVersion, hex) =>
      SCALETuple.decode(
        configuration,
        runtimeVersion,
        hex,
        (configuration, _, first) => SCALEAccountId.decode(configuration, first),
        (_configuration, _runtimeVersion, second) => SCALECompactInt.decode(second)
      )
    )

    return new SubstrateExposure(total.decoded, own.decoded, others.decoded)
  }

  private constructor(
    readonly total: SCALECompactInt,
    readonly own: SCALECompactInt,
    readonly others: SCALEArray<SCALETuple<SCALEAccountId<C>, SCALECompactInt>>
  ) {}
}
