import { SCALEClass } from "../../../../type/SCALEClass";
import { SCALEDecodeResult, DecoderMethod } from "../../../../type/SCALEDecoder";
import { SCALEEnum } from "../../../../type/scaleEnum";
import { SCALEDecoder } from "../../../../type/SCALEDecoder";
import { SCALEType } from "../../../../type/SCALEType";
import { SCALEString } from "../../../../type/primitive/SCALEString";
import { SCALEBoolean } from "../../../../type/primitive/SCALEBoolean";

enum StorageHasher {
    Blake2_128 = 0, 
    Blake2_256,  
    Blake2_128Concat,
    Twox128,
    Twox256,
    Twox64Concat
}

enum StorageEntryType {
    Plain = 0,
    Map,
    DoubleMap
}

export abstract class MetadataStorageEntryType extends SCALEClass {
    
    public static decode(raw: string): SCALEDecodeResult<MetadataStorageEntryType> {
        const prefix = parseInt(raw.substr(0, 2), 16)

        let decoderMethod: DecoderMethod<MetadataStorageEntryType>
        switch (prefix) {
            case 0:
                decoderMethod = MetadataStorageEntryPlain.decode
                break
            case 1:
                decoderMethod = MetadataStorageEntryMap.decode
                break
            case 2:
                decoderMethod = MetadataStorageEntryDoubleMap.decode
                break
            default:
                throw new Error('Unkown metadata storage entry type')
        }

        const decoded = decoderMethod(raw.slice(2))
        return {
            bytesDecoded: 1 + decoded.bytesDecoded,
            decoded: decoded.decoded
        }
    }

    protected abstract readonly type: SCALEEnum<StorageEntryType>
    protected abstract readonly _scaleFields: SCALEType[]

    protected get scaleFields(): SCALEType[] {
        return [this.type, ...this._scaleFields]
    }
}

export class MetadataStorageEntryPlain extends MetadataStorageEntryType {

    public static decode(raw: string): SCALEDecodeResult<MetadataStorageEntryPlain> {
        const decoder = new SCALEDecoder(raw)

        const name = decoder.decodeNextString()
        return {
            bytesDecoded: name.bytesDecoded,
            decoded: new MetadataStorageEntryPlain(name.decoded)
        }
    }

    protected readonly type = SCALEEnum.from(StorageEntryType.Plain)
    protected readonly _scaleFields = [this.name]

    private constructor(readonly name: SCALEString) { super() }
}

export class MetadataStorageEntryMap extends MetadataStorageEntryType {

    public static decode(raw: string): SCALEDecodeResult<MetadataStorageEntryMap> {
        const decoder = new SCALEDecoder(raw)

        const hasher = decoder.decodeNextEnum(value => StorageHasher[StorageHasher[value]])
        const key = decoder.decodeNextString()
        const value = decoder.decodeNextString()
        const isLinked = decoder.decodeNextBoolean()

        return {
            bytesDecoded: hasher.bytesDecoded + key.bytesDecoded + value.bytesDecoded + isLinked.bytesDecoded,
            decoded: new MetadataStorageEntryMap(hasher.decoded, key.decoded, value.decoded, isLinked.decoded)
        }
    }

    protected readonly type = SCALEEnum.from(StorageEntryType.Map)
    protected readonly _scaleFields = [this.hasher, this.key, this.value, this.isLinked]

    private constructor(
        readonly hasher: SCALEEnum<StorageHasher>,
        readonly key: SCALEString,
        readonly value: SCALEString,
        readonly isLinked: SCALEBoolean
    ) { super() }
}

export class MetadataStorageEntryDoubleMap extends MetadataStorageEntryType {

    public static decode(raw: string): SCALEDecodeResult<MetadataStorageEntryDoubleMap> {
        const decoder = new SCALEDecoder(raw)

        const hasher = decoder.decodeNextEnum(value => StorageHasher[StorageHasher[value]])
        const key1 = decoder.decodeNextString()
        const key2 = decoder.decodeNextString()
        const value = decoder.decodeNextString()
        const key2Hasher = decoder.decodeNextEnum(value => StorageHasher[StorageHasher[value]])

        return {
            bytesDecoded: hasher.bytesDecoded + key1.bytesDecoded + key2.bytesDecoded + value.bytesDecoded + key2Hasher.bytesDecoded,
            decoded: new MetadataStorageEntryDoubleMap(hasher.decoded, key1.decoded, key2.decoded, value.decoded, key2Hasher.decoded)
        }
    }

    protected readonly type = SCALEEnum.from(StorageEntryType.Map)
    protected readonly _scaleFields = [this.hasher, this.key1, this.key2, this.value, this.key2Hasher]

    private constructor(
        readonly hasher: SCALEEnum<StorageHasher>,
        readonly key1: SCALEString,
        readonly key2: SCALEString,
        readonly value: SCALEString,
        readonly key2Hasher: SCALEEnum<StorageHasher>,
    ) { super() }
}