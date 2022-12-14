import { SCALEAccountId, SCALEClass, SCALEDecoder, SCALEDecodeResult, SCALEInt, SCALEType } from '@airgap/substrate/v1'

import { MoonbeamProtocolConfiguration } from '../../types/configuration'

export class MoonbeamBond<C extends MoonbeamProtocolConfiguration = MoonbeamProtocolConfiguration> extends SCALEClass {
  public static decode<C extends MoonbeamProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MoonbeamBond<C>> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const owner = decoder.decodeNextAccountId(20)
    const amount = decoder.decodeNextInt(128)

    return {
      bytesDecoded: owner.bytesDecoded + amount.bytesDecoded,
      decoded: new MoonbeamBond(owner.decoded, amount.decoded)
    }
  }

  protected scaleFields: SCALEType[] = [this.owner, this.amount]

  private constructor(public readonly owner: SCALEAccountId<C>, public readonly amount: SCALEInt) {
    super()
  }
}
