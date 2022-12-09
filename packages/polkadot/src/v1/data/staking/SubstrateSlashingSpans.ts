import { SCALEDecoder, SCALEInt, SCALEArray } from '@airgap/substrate/v1'
import { PolkadotProtocolConfiguration } from '../../types/configuration'

export class SubstrateSlashingSpans {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateSlashingSpans {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const spanIndex = decoder.decodeNextInt(32)
    const lastStart = decoder.decodeNextInt(32)
    const lastNonzeroSlash = decoder.decodeNextInt(32)
    const prior = decoder.decodeNextArray((_configuration, _runtimeVersion, hex) => SCALEInt.decode(hex, 32))

    return new SubstrateSlashingSpans(spanIndex.decoded, lastStart.decoded, lastNonzeroSlash.decoded, prior.decoded)
  }

  private constructor(
    readonly spanIndex: SCALEInt,
    readonly lastStart: SCALEInt,
    readonly lastNonzeroSlash: SCALEInt,
    readonly prior: SCALEArray<SCALEInt>
  ) {}
}
