import { SCALEClass } from '../../../codec/type/SCALEClass'
import { SCALEDecodeResult, DecoderMethod } from '../../../codec/SCALEDecoder'
import { SCALEEnum } from '../../../codec/type/SCALEEnum'
import { SCALEDecoder } from '../../../codec/SCALEDecoder'
import { SCALEType } from '../../../codec/type/SCALEType'
import { SCALEString } from '../../../codec/type/SCALEString'
import { SCALEBoolean } from '../../../codec/type/SCALEBoolean'
import { PolkadotStorageEntryHasher } from '../../../storage/PolkadotStorageEntry'

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

        const hasher = decoder.decodeNextEnum(value => PolkadotStorageEntryHasher[PolkadotStorageEntryHasher[value]])
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
        readonly hasher: SCALEEnum<PolkadotStorageEntryHasher>,
        readonly key: SCALEString,
        readonly value: SCALEString,
        readonly isLinked: SCALEBoolean
    ) { super() }
}

export class MetadataStorageEntryDoubleMap extends MetadataStorageEntryType {

    public static decode(raw: string): SCALEDecodeResult<MetadataStorageEntryDoubleMap> {
        const decoder = new SCALEDecoder(raw)

        const hasher1 = decoder.decodeNextEnum(value => PolkadotStorageEntryHasher[PolkadotStorageEntryHasher[value]])
        const key1 = decoder.decodeNextString()
        const key2 = decoder.decodeNextString()
        const value = decoder.decodeNextString()
        const hasher2 = decoder.decodeNextEnum(value => PolkadotStorageEntryHasher[PolkadotStorageEntryHasher[value]])

        return {
            bytesDecoded: hasher1.bytesDecoded + key1.bytesDecoded + key2.bytesDecoded + value.bytesDecoded + hasher2.bytesDecoded,
            decoded: new MetadataStorageEntryDoubleMap(hasher1.decoded, key1.decoded, key2.decoded, value.decoded, hasher2.decoded)
        }
    }

    protected readonly type = SCALEEnum.from(StorageEntryType.Map)
    protected readonly _scaleFields = [this.hasher1, this.key1, this.key2, this.value, this.hasher2]

    private constructor(
        readonly hasher1: SCALEEnum<PolkadotStorageEntryHasher>,
        readonly key1: SCALEString,
        readonly key2: SCALEString,
        readonly value: SCALEString,
        readonly hasher2: SCALEEnum<PolkadotStorageEntryHasher>,
    ) { super() }
}