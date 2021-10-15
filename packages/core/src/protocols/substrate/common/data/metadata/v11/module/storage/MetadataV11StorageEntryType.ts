// tslint:disable: max-classes-per-file
import { InvalidValueError } from '../../../../../../../../errors'
import { Domain } from '../../../../../../../../errors/coinlib-error'
import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { DecoderMethod, SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEBoolean } from '../../../../scale/type/SCALEBoolean'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALEEnum } from '../../../../scale/type/SCALEEnum'
import { SCALEString } from '../../../../scale/type/SCALEString'
import { SCALEType } from '../../../../scale/type/SCALEType'
import {
  SubstrateDoubleMapStorageEntry,
  SubstrateMapStorageEntry,
  SubstratePlainStorageEntry,
  SubstrateStorageEntry,
  SubstrateStorageEntryHasher
} from '../../../decorator/storage/SubstrateStorageEntry'

enum StorageEntryType {
  Plain = 0,
  Map,
  DoubleMap
}

export abstract class MetadataV11StorageEntryType extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV11StorageEntryType> {
    const prefix = parseInt(raw.substring(0, 2), 16)

    let decoderMethod: DecoderMethod<MetadataV11StorageEntryType, Network>
    switch (prefix) {
      case StorageEntryType.Plain:
        decoderMethod = MetadataV11StorageEntryPlain.decode
        break
      case StorageEntryType.Map:
        decoderMethod = MetadataV11StorageEntryMap.decode
        break
      case StorageEntryType.DoubleMap:
        decoderMethod = MetadataV11StorageEntryDoubleMap.decode
        break
      default:
        throw new InvalidValueError(Domain.SUBSTRATE, 'Unknown metadata storage entry type')
    }

    const decoded = decoderMethod(network, runtimeVersion, raw.slice(2))

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

  public abstract decorate(moduleName: string, prefix: string): SubstrateStorageEntry
}

export class MetadataV11StorageEntryPlain extends MetadataV11StorageEntryType {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV11StorageEntryPlain> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const name = decoder.decodeNextString()

    return {
      bytesDecoded: name.bytesDecoded,
      decoded: new MetadataV11StorageEntryPlain(name.decoded)
    }
  }

  protected readonly type = SCALEEnum.from(StorageEntryType.Plain)
  protected readonly _scaleFields = [this.name]

  private constructor(readonly name: SCALEString) {
    super()
  }

  public decorate(moduleName: string, prefix: string): SubstrateStorageEntry {
    return new SubstratePlainStorageEntry(moduleName, prefix)
  }
}

export class MetadataV11StorageEntryMap extends MetadataV11StorageEntryType {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV11StorageEntryMap> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const hasher = decoder.decodeNextEnum((value) => SubstrateStorageEntryHasher[SubstrateStorageEntryHasher[value]])
    const key = decoder.decodeNextString()
    const value = decoder.decodeNextString()
    const unused = decoder.decodeNextBoolean()

    return {
      bytesDecoded: hasher.bytesDecoded + key.bytesDecoded + value.bytesDecoded + unused.bytesDecoded,
      decoded: new MetadataV11StorageEntryMap(hasher.decoded, key.decoded, value.decoded, unused.decoded)
    }
  }

  protected readonly type = SCALEEnum.from(StorageEntryType.Map)
  protected readonly _scaleFields = [this.hasher, this.key, this.value, this.unused]

  private constructor(
    readonly hasher: SCALEEnum<SubstrateStorageEntryHasher>,
    readonly key: SCALEString,
    readonly value: SCALEString,
    readonly unused: SCALEBoolean
  ) {
    super()
  }

  public decorate(moduleName: string, prefix: string): SubstrateStorageEntry {
    return new SubstrateMapStorageEntry(moduleName, prefix, this.hasher.value)
  }
}

export class MetadataV11StorageEntryDoubleMap extends MetadataV11StorageEntryType {
  public static decode(
    network: SubstrateNetwork,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV11StorageEntryDoubleMap> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const hasher1 = decoder.decodeNextEnum((value) => SubstrateStorageEntryHasher[SubstrateStorageEntryHasher[value]])
    const key1 = decoder.decodeNextString()
    const key2 = decoder.decodeNextString()
    const value = decoder.decodeNextString()
    const hasher2 = decoder.decodeNextEnum((value) => SubstrateStorageEntryHasher[SubstrateStorageEntryHasher[value]])

    return {
      bytesDecoded: hasher1.bytesDecoded + key1.bytesDecoded + key2.bytesDecoded + value.bytesDecoded + hasher2.bytesDecoded,
      decoded: new MetadataV11StorageEntryDoubleMap(hasher1.decoded, key1.decoded, key2.decoded, value.decoded, hasher2.decoded)
    }
  }

  protected readonly type = SCALEEnum.from(StorageEntryType.DoubleMap)
  protected readonly _scaleFields = [this.hasher1, this.key1, this.key2, this.value, this.hasher2]

  private constructor(
    readonly hasher1: SCALEEnum<SubstrateStorageEntryHasher>,
    readonly key1: SCALEString,
    readonly key2: SCALEString,
    readonly value: SCALEString,
    readonly hasher2: SCALEEnum<SubstrateStorageEntryHasher>
  ) {
    super()
  }

  public decorate(moduleName: string, prefix: string): SubstrateStorageEntry {
    return new SubstrateDoubleMapStorageEntry(moduleName, prefix, this.hasher1.value, this.hasher2.value)
  }
}
