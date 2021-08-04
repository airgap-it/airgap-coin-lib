import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALEInt } from '../scale/type/SCALEInt'

export class SubstrateSlashingSpans {
  public static decode<Network extends SubstrateNetwork>(
    network: Network, 
    runtimeVersion: number | undefined, 
    raw: string
  ): SubstrateSlashingSpans {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const spanIndex = decoder.decodeNextInt(32)
    const lastStart = decoder.decodeNextInt(32)
    const lastNonzeroSlash = decoder.decodeNextInt(32)
    const prior = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEInt.decode(hex, 32))

    return new SubstrateSlashingSpans(spanIndex.decoded, lastStart.decoded, lastNonzeroSlash.decoded, prior.decoded)
  }

  private constructor(
    readonly spanIndex: SCALEInt,
    readonly lastStart: SCALEInt,
    readonly lastNonzeroSlash: SCALEInt,
    readonly prior: SCALEArray<SCALEInt>
  ) {}
}
