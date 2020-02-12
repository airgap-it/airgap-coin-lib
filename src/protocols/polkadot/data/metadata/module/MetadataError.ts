import { SCALEClass } from "../../../type/SCALEClass";
import { SCALEString } from "../../../type/primitive/SCALEString";
import { SCALEDecodeResult } from "../../../type/SCALEDecoder";
import { SCALEArray } from "../../../type/collection/SCALEArray";
import { SCALEDecoder } from "../../../type/SCALEDecoder";

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