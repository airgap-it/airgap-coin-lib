import { SCALEClass } from '../../codec/type/SCALEClass'
import { SCALEString } from '../../codec/type/SCALEString'
import { SCALEDecodeResult } from '../../codec/SCALEDecoder'
import { SCALEArray } from '../../codec/type/SCALEArray'
import { SCALEDecoder } from '../../codec/SCALEDecoder'

export class MetadataEvent extends SCALEClass {

    public static decode(raw: string): SCALEDecodeResult<MetadataEvent> {
        const decoder = new SCALEDecoder(raw)

        const name = decoder.decodeNextString()
        const args = decoder.decodeNextArray(SCALEString.decode)
        const docs = decoder.decodeNextArray(SCALEString.decode)

        return {
            bytesDecoded: name.bytesDecoded + args.bytesDecoded + docs.bytesDecoded,
            decoded: new MetadataEvent(name.decoded, args.decoded, docs.decoded)
        }
    }

    scaleFields = [this.name, this.args, this.docs]

    private constructor(
        readonly name: SCALEString,
        readonly args: SCALEArray<SCALEString>,
        readonly docs: SCALEArray<SCALEString>
    ) { super() }
}