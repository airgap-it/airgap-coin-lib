// tslint:disable: max-classes-per-file
import { InvalidValueError } from '../../../../../../../../errors'
import { Domain } from '../../../../../../../../errors/coinlib-error'
import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { DecoderMethod, SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEBoolean } from '../../../../scale/type/SCALEBoolean'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALEEnum } from '../../../../scale/type/SCALEEnum'
import { SCALEString } from '../../../../scale/type/SCALEString'
import { SCALEType } from '../../../../scale/type/SCALEType'
import {
  SubstrateDoubleMapStorageEntry,
  SubstrateMapStorageEntry,
  SubstrateNMapStorageEntry,
  SubstratePlainStorageEntry,
  SubstrateStorageEntry,
  SubstrateStorageEntryHasher
} from '../../../decorator/storage/SubstrateStorageEntry'
import {
  MetadataV11StorageEntryDoubleMap,
  MetadataV11StorageEntryMap,
  MetadataV11StorageEntryPlain
} from '../../../v11/module/storage/MetadataV11StorageEntryType'

enum StorageEntryType {
  Plain = 0,
  Map,
  DoubleMap,
  NMap
}

export abstract class MetadataV13StorageEntryType extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV13StorageEntryType> {
    const prefix = parseInt(raw.substring(0, 2), 16)

    let decoderMethod: DecoderMethod<MetadataV13StorageEntryType, Network>
    switch (prefix) {
      case StorageEntryType.Plain:
        decoderMethod = MetadataV13StorageEntryPlain.decode
        break
      case StorageEntryType.Map:
        decoderMethod = MetadataV13StorageEntryMap.decode
        break
      case StorageEntryType.DoubleMap:
        decoderMethod = MetadataV13StorageEntryDoubleMap.decode
        break
      case StorageEntryType.NMap:
        decoderMethod = MetadataV13StorageEntryNMap.decode
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

export class MetadataV13StorageEntryPlain extends MetadataV13StorageEntryType {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV13StorageEntryPlain> {
    const v11 = MetadataV11StorageEntryPlain.decode(network, runtimeVersion, raw)

    return {
      bytesDecoded: v11.bytesDecoded,
      decoded: new MetadataV13StorageEntryPlain(v11.decoded.name)
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

export class MetadataV13StorageEntryMap extends MetadataV13StorageEntryType {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV13StorageEntryMap> {
    const v11 = MetadataV11StorageEntryMap.decode(network, runtimeVersion, raw)

    return {
      bytesDecoded: v11.bytesDecoded,
      decoded: new MetadataV13StorageEntryMap(v11.decoded.hasher, v11.decoded.key, v11.decoded.value, v11.decoded.unused)
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

export class MetadataV13StorageEntryDoubleMap extends MetadataV13StorageEntryType {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV13StorageEntryDoubleMap> {
    const v11 = MetadataV11StorageEntryDoubleMap.decode(network, runtimeVersion, raw)

    return {
      bytesDecoded: v11.bytesDecoded,
      decoded: new MetadataV13StorageEntryDoubleMap(
        v11.decoded.hasher1,
        v11.decoded.key1,
        v11.decoded.key2,
        v11.decoded.value,
        v11.decoded.hasher2
      )
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

export class MetadataV13StorageEntryNMap extends MetadataV13StorageEntryType {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV13StorageEntryNMap> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const keyVec = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALEString.decode(hex))
    const hashers = decoder.decodeNextArray((_network, _runtimeVersion, hex) =>
      SCALEEnum.decode(hex, (value) => SubstrateStorageEntryHasher[SubstrateStorageEntryHasher[value]])
    )
    const value = decoder.decodeNextString()

    return {
      bytesDecoded: keyVec.bytesDecoded + hashers.bytesDecoded + value.bytesDecoded,
      decoded: new MetadataV13StorageEntryNMap(keyVec.decoded, hashers.decoded, value.decoded)
    }
  }

  protected readonly type = SCALEEnum.from(StorageEntryType.NMap)
  protected readonly _scaleFields = [this.keyVec, this.hashers, this.value]

  private constructor(
    readonly keyVec: SCALEArray<SCALEString>,
    readonly hashers: SCALEArray<SCALEEnum<SubstrateStorageEntryHasher>>,
    readonly value: SCALEString
  ) {
    super()
  }

  public decorate(moduleName: string, prefix: string): SubstrateStorageEntry {
    return new SubstrateNMapStorageEntry(
      moduleName,
      prefix,
      this.hashers.elements.map((hasher) => hasher.value)
    )
  }
}
