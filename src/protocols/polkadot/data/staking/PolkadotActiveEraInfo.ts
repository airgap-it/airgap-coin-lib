import { SCALEInt } from '../scale/type/SCALEInt'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALEOptional } from '../scale/type/SCALEOptional'

export class PolkadotActiveEraInfo {

    public static decode(raw: string): PolkadotActiveEraInfo {
        const decoder = new SCALEDecoder(raw)

        const index = decoder.decodeNextInt(32)
        const start = decoder.decodeNextOptional(hex => SCALEInt.decode(hex, 64))

        return new PolkadotActiveEraInfo(index.decoded, start.decoded)
    }

    private constructor(
        readonly index: SCALEInt,
        readonly start: SCALEOptional<SCALEInt>
    ) {}
}