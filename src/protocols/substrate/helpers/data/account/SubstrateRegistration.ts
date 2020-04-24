import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALETuple } from '../scale/type/SCALETuple'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEEnum } from '../scale/type/SCALEEnum'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEHash } from '../scale/type/SCALEHash'
import { hexToBytes } from '../../../../../utils/hex'
import { SCALEBytes } from '../scale/type/SCALEBytes'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

enum SubstrateJudgment {
    UNKNOWN = 0,
    FEE_PAID,
    REASONABLE,
    KNOWN_GOOD,
    OUT_OF_DATE,
    LOW_QUALITY,
    ERRORNEOUS
}

export class SubstrateIdentityInfo {
    public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<SubstrateIdentityInfo> {
        const decoder = new SCALEDecoder(network, raw)

        const dataDecodeMethod = (_, hex) => {
            const encoded = hexToBytes(hex)
            const indicator = encoded[0]

            let bytes: number
            if (indicator === 0) {
                bytes = 1
            } else if (indicator >= 1 && indicator <= 33) {
                const length = indicator - 1
                bytes = length + 1
            } else {
                bytes = 32 + 1
            }

            return {
                bytesDecoded: bytes,
                decoded: SCALEBytes.from(encoded.subarray(1, bytes))
            }
        }

        const additional = decoder.decodeNextArray((network, hex) => SCALETuple.decode(network, hex, dataDecodeMethod, dataDecodeMethod))
        const display = decoder.decodeNextObject(dataDecodeMethod)
        const legal = decoder.decodeNextObject(dataDecodeMethod)
        const web = decoder.decodeNextObject(dataDecodeMethod)
        const riot = decoder.decodeNextObject(dataDecodeMethod)
        const email = decoder.decodeNextObject(dataDecodeMethod)
        const fingerprint = decoder.decodeNextOptional((_, hex) => SCALEHash.decode(hex, 20))
        const image = decoder.decodeNextObject(dataDecodeMethod)
        const twitter = decoder.decodeNextObject(dataDecodeMethod)

        return {
            bytesDecoded: additional.bytesDecoded + display.bytesDecoded + legal.bytesDecoded + web.bytesDecoded + 
                riot.bytesDecoded + email.bytesDecoded + fingerprint.bytesDecoded + image.bytesDecoded + twitter.bytesDecoded,
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

    public readonly display: string
    public readonly legal: string
    public readonly web: string
    public readonly riot: string
    public readonly email: string
    public readonly image: string
    public readonly twitter: string

    private constructor(
        readonly displayRaw: SCALEBytes,
        readonly legalRaw: SCALEBytes,
        readonly webRaw: SCALEBytes,
        readonly riotRaw: SCALEBytes,
        readonly emailRaw: SCALEBytes,
        readonly imageRaw: SCALEBytes,
        readonly twitterRaw: SCALEBytes
    ) {
        const textDecoder = new TextDecoder()
        this.display = textDecoder.decode(displayRaw.bytes)
        this.legal = textDecoder.decode(legalRaw.bytes)
        this.web = textDecoder.decode(webRaw.bytes)
        this.riot = textDecoder.decode(riotRaw.bytes)
        this.email = textDecoder.decode(emailRaw.bytes)
        this.image = textDecoder.decode(imageRaw.bytes)
        this.twitter = textDecoder.decode(twitterRaw.bytes)
    }
}

export class SubstrateRegistration {
    public static decode(network: SubstrateNetwork, raw: string): SubstrateRegistration {
        const decoder = new SCALEDecoder(network, raw)

        const judgments = decoder.decodeNextArray((network, hex) =>
            SCALETuple.decode(
                network,
                hex, 
                (_, first) => SCALEInt.decode(first, 32), 
                (_, second) => {
                    const value = SCALEEnum.decode(second, value => SubstrateJudgment[SubstrateJudgment[value]])
                    let bytesDecoded = value.bytesDecoded
                    if (value.decoded.value === SubstrateJudgment.FEE_PAID) {
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

        return new SubstrateRegistration(judgments.decoded, deposit.decoded, identityInfo.decoded)
    }

    private constructor(
        readonly judgments: SCALEArray<SCALETuple<SCALEInt, SCALEEnum<SubstrateJudgment>>>,
        readonly deposit: SCALEInt,
        readonly identityInfo: SubstrateIdentityInfo
    ) {}

}