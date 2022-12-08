// tslint:disable: max-classes-per-file
import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALEData } from '../scale/type/SCALEData'
import { SCALEEnum } from '../scale/type/SCALEEnum'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALETuple } from '../scale/type/SCALETuple'

enum SubstrateJudgement {
  UNKNOWN = 0,
  FEE_PAID,
  REASONABLE,
  KNOWN_GOOD,
  OUT_OF_DATE,
  LOW_QUALITY,
  ERRORNEOUS
}

export class SubstrateIdentityInfo {
  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<SubstrateIdentityInfo> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const additional = decoder.decodeNextArray((configuration, runtimeVersion, hex) =>
      SCALETuple.decode(
        configuration,
        runtimeVersion,
        hex,
        (_configuration, _runtimeVersion, hex) => SCALEData.decode(hex),
        (_configuration, _runtimeVersion, hex) => SCALEData.decode(hex)
      )
    )
    const display = decoder.decodeNextData()
    const legal = decoder.decodeNextData()
    const web = decoder.decodeNextData()
    const riot = decoder.decodeNextData()
    const email = decoder.decodeNextData()
    const fingerprint = decoder.decodeNextOptional((_configuration, _runtimeVersion, hex) => SCALEHash.decode(hex, 20))
    const image = decoder.decodeNextData()
    const twitter = decoder.decodeNextData()

    return {
      bytesDecoded:
        additional.bytesDecoded +
        display.bytesDecoded +
        legal.bytesDecoded +
        web.bytesDecoded +
        riot.bytesDecoded +
        email.bytesDecoded +
        fingerprint.bytesDecoded +
        image.bytesDecoded +
        twitter.bytesDecoded,
      decoded: new SubstrateIdentityInfo(
        display.decoded,
        legal.decoded,
        web.decoded,
        riot.decoded,
        email.decoded,
        image.decoded,
        twitter.decoded
      )
    }
  }

  private constructor(
    readonly display: SCALEData,
    readonly legal: SCALEData,
    readonly web: SCALEData,
    readonly riot: SCALEData,
    readonly email: SCALEData,
    readonly image: SCALEData,
    readonly twitter: SCALEData
  ) {}
}

export class SubstrateRegistration {
  public static decode(
    configuration: SubstrateProtocolConfiguration,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateRegistration {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const judgements = decoder.decodeNextArray((configuration, runtimeVersion, hex) =>
      SCALETuple.decode(
        configuration,
        runtimeVersion,
        hex,
        (_configuration, _runtimeVersion, first) => SCALEInt.decode(first, 32),
        (_configuration, _runtimeVersion, second) => {
          const value = SCALEEnum.decode(second, (value) => SubstrateJudgement[SubstrateJudgement[value]])
          let bytesDecoded = value.bytesDecoded
          if (value.decoded.value === SubstrateJudgement.FEE_PAID) {
            const balance = SCALEInt.decode(second.slice(0, bytesDecoded * 2), 128)
            bytesDecoded += balance.bytesDecoded
          }

          return {
            bytesDecoded,
            decoded: value.decoded
          }
        }
      )
    )
    const deposit = decoder.decodeNextInt(128)
    const identityInfo = decoder.decodeNextObject(SubstrateIdentityInfo.decode)

    return new SubstrateRegistration(judgements.decoded, deposit.decoded, identityInfo.decoded)
  }

  private constructor(
    readonly judgements: SCALEArray<SCALETuple<SCALEInt, SCALEEnum<SubstrateJudgement>>>,
    readonly deposit: SCALEInt,
    readonly identityInfo: SubstrateIdentityInfo
  ) {}
}
