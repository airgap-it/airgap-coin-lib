import { SCALEArray, SCALEDecoder, SCALEInt } from '@airgap/substrate/v1'

import { PolkadotProtocolConfiguration } from '../../types/configuration'

export class PolkadotSlashingSpans {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): PolkadotSlashingSpans {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const spanIndex = decoder.decodeNextInt(32)
    const lastStart = decoder.decodeNextInt(32)
    const lastNonzeroSlash = decoder.decodeNextInt(32)
    const prior = decoder.decodeNextArray((_configuration, _runtimeVersion, hex) => SCALEInt.decode(hex, 32))

    return new PolkadotSlashingSpans(spanIndex.decoded, lastStart.decoded, lastNonzeroSlash.decoded, prior.decoded)
  }

  private constructor(
    readonly spanIndex: SCALEInt,
    readonly lastStart: SCALEInt,
    readonly lastNonzeroSlash: SCALEInt,
    readonly prior: SCALEArray<SCALEInt>
  ) {}
}
