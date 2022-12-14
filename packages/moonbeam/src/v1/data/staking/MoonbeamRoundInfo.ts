import { SCALEDecoder, SCALEInt } from '@airgap/substrate/v1'

import { MoonbeamProtocolConfiguration } from '../../types/configuration'

export class MoonbeamRoundInfo {
  public static decode<C extends MoonbeamProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): MoonbeamRoundInfo {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const current = decoder.decodeNextInt(32)
    const first = decoder.decodeNextInt(32)
    const length = decoder.decodeNextInt(32)

    return new MoonbeamRoundInfo(current.decoded, first.decoded, length.decoded)
  }

  private constructor(public readonly current: SCALEInt, public readonly first: SCALEInt, public readonly length: SCALEInt) {}
}
