import { SCALEClass, SCALEDecoder, SCALEDecodeResult, SCALEInt, SCALEType } from '@airgap/substrate/v1'

import { MoonbeamProtocolConfiguration } from '../../types/configuration'

export class MoonbeamCandidateBondLessRequest extends SCALEClass {
  public static decode<C extends MoonbeamProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MoonbeamCandidateBondLessRequest> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const amount = decoder.decodeNextInt(128)
    const whenExecutable = decoder.decodeNextInt(32)

    return {
      bytesDecoded: amount.bytesDecoded + whenExecutable.bytesDecoded,
      decoded: new MoonbeamCandidateBondLessRequest(amount.decoded, whenExecutable.decoded)
    }
  }

  protected scaleFields: SCALEType[] = [this.amount]

  private constructor(public readonly amount: SCALEInt, public readonly whenExecutable: SCALEInt) {
    super()
  }
}
