import { SCALEClass } from '../../scale/type/SCALEClass'
import { SCALEString } from '../../scale/type/SCALEString'
import { SCALEDecodeResult } from '../../scale/SCALEDecoder'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SCALEDecoder } from '../../scale/SCALEDecoder'

export class MetadataError extends SCALEClass {

    public static decode(raw: string): SCALEDecodeResult<MetadataError> {
        const decoder = new SCALEDecoder(raw)

        const name = decoder.decodeNextString()
        const docs = decoder.decodeNextArray(SCALEString.decode)

        return {
            bytesDecoded: name.bytesDecoded + docs.bytesDecoded,
            decoded: new MetadataError(name.decoded, docs.decoded)
        }
    }

    protected scaleFields = [this.name, this.docs]

    private constructor(
        readonly name: SCALEString,
        readonly docs: SCALEArray<SCALEString>
    ) { super() }
}