import { SCALEClass } from "../../../codec/type/SCALEClass";
import { SCALEString } from "../../../codec/type/SCALEString";
import { SCALEDecodeResult } from "../../../codec/SCALEDecoder";
import { SCALEArray } from "../../../codec/type/SCALEArray";
import { SCALEDecoder } from "../../../codec/SCALEDecoder";

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