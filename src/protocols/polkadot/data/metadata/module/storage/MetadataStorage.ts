import { SCALEClass } from "../../../../type/SCALEClass";
import { SCALEString } from "../../../../type/primitive/SCALEString";
import { SCALEArray } from "../../../../type/collection/SCALEArray";
import { SCALEDecoder } from "../../../../type/SCALEDecoder";
import { SCALEDecodeResult } from "../../../../type/SCALEDecoder";
import { stripHexPrefix } from "../../../../../../utils/hex";
import { MetadataStorageEntry } from "./MetadataStorageEntry";

export class MetadataStorage extends SCALEClass {

    public static decode(raw: string): SCALEDecodeResult<MetadataStorage> {
        const decoder = new SCALEDecoder(stripHexPrefix(raw))

        const prefix = decoder.decodeNextString()
        const storageEntries = decoder.decodeNextArray(MetadataStorageEntry.decode)

        return {
            bytesDecoded: prefix.bytesDecoded + storageEntries.bytesDecoded,
            decoded: new MetadataStorage(prefix.decoded, storageEntries.decoded)
        }
    }

    protected scaleFields = [this.prefix]

    private constructor(
        readonly prefix: SCALEString,
        readonly storageEntries: SCALEArray<MetadataStorageEntry>
    ) { super() }
}