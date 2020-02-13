import { SCALEClass } from "../../codec/type/SCALEClass";
import { SCALEString } from "../../codec/type/SCALEString";
import { SCALEDecodeResult } from "../../codec/SCALEDecoder";
import { SCALEBytes } from "../../codec/type/SCALEBytes";
import { SCALEArray } from "../../codec/type/SCALEArray";
import { SCALEDecoder } from "../../codec/SCALEDecoder";

export class MetadataConstant extends SCALEClass {

    public static decode(raw: string): SCALEDecodeResult<MetadataConstant> {
        const decoder = new SCALEDecoder(raw)

        const name = decoder.decodeNextString()
        const type = decoder.decodeNextString()
        const value = decoder.decodeNextBytes()
        const docs = decoder.decodeNextArray(SCALEString.decode)

        return {
            bytesDecoded: name.bytesDecoded + type.bytesDecoded + value.bytesDecoded + docs.bytesDecoded,
            decoded: new MetadataConstant(name.decoded, type.decoded, value.decoded, docs.decoded)
        }
    }

    protected scaleFields = [this.name, this.type, this.value, this.docs]

    private constructor(
        readonly name: SCALEString,
        readonly type: SCALEString,
        readonly value: SCALEBytes,
        readonly docs: SCALEArray<SCALEString>
    ) { super() }
}