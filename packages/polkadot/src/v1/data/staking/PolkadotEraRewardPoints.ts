import { SCALEAccountId, SCALEArray, SCALEDecoder, SCALEInt, SCALETuple } from '@airgap/substrate/v1'

import { PolkadotProtocolConfiguration } from '../../types/configuration'

export class PolkadotEraRewardPoints<C extends PolkadotProtocolConfiguration = PolkadotProtocolConfiguration> {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): PolkadotEraRewardPoints<C> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const total = decoder.decodeNextInt(32)
    const individual = decoder.decodeNextArray((configuration, runtimeVersion, hex) =>
      SCALETuple.decode(
        configuration,
        runtimeVersion,
        hex,
        (configuration, _, first) => SCALEAccountId.decode(configuration, first),
        (_configuration, _runtimeVersion, second) => SCALEInt.decode(second, 32)
      )
    )

    return new PolkadotEraRewardPoints(total.decoded, individual.decoded)
  }

  private constructor(readonly total: SCALEInt, readonly individual: SCALEArray<SCALETuple<SCALEAccountId<C>, SCALEInt>>) {}
}
