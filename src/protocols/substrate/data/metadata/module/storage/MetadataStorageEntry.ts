import { SCALEClass } from '../../../scale/type/SCALEClass'
import { SCALEDecodeResult } from '../../../scale/SCALEDecoder'
import { SCALEString } from '../../../scale/type/SCALEString'
import { SCALEDecoder } from '../../../scale/SCALEDecoder'
import { SCALEEnum } from '../../../scale/type/SCALEEnum'
import { MetadataStorageEntryType } from './MetadataStorageEntryType'
import { SCALEBytes } from '../../../scale/type/SCALEBytes'
import { SCALEArray } from '../../../scale/type/SCALEArray'

enum StorageEntryModifier {
    Optional = 0,
    Default
}

export class MetadataStorageEntry extends SCALEClass {

    public static decode(raw: string): SCALEDecodeResult<MetadataStorageEntry> {
        const decoder = new SCALEDecoder(raw)

        const name = decoder.decodeNextString()
        const modifier = decoder.decodeNextEnum(value => StorageEntryModifier[StorageEntryModifier[value]])
        const type = decoder.decodeNextObject(MetadataStorageEntryType.decode)
        const defaultValue = decoder.decodeNextBytes()
        const docs = decoder.decodeNextArray(SCALEString.decode)

        return {
            bytesDecoded: name.bytesDecoded + modifier.bytesDecoded + type.bytesDecoded + defaultValue.bytesDecoded + docs.bytesDecoded,
            decoded: new MetadataStorageEntry(name.decoded, modifier.decoded, type.decoded, defaultValue.decoded, docs.decoded)
        }
    }

    protected scaleFields = [this.name, this.modifier, this.type, this.defaultValue]

    private constructor(
        readonly name: SCALEString,
        readonly modifier: SCALEEnum<StorageEntryModifier>,
        readonly type: MetadataStorageEntryType,
        readonly defaultValue: SCALEBytes,
        readonly docs: SCALEArray<SCALEString>
    ) { super() }
}