// tslint:disable: max-classes-per-file
import { InvalidValueError } from '../../../../../../../../errors'
import { Domain } from '../../../../../../../../errors/coinlib-error'
import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { DecoderMethod, SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALECompactInt } from '../../../../scale/type/SCALECompactInt'
import { SCALEEnum } from '../../../../scale/type/SCALEEnum'
import { SCALEType } from '../../../../scale/type/SCALEType'
import {
  SubstrateNMapStorageEntry,
  SubstratePlainStorageEntry,
  SubstrateStorageEntry,
  SubstrateStorageEntryHasher
} from '../../../decorator/storage/SubstrateStorageEntry'

enum StorageEntryType {
  Plain = 0,
  Map
}

export abstract class MetadataV14StorageEntryType extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14StorageEntryType> {
    const prefix = parseInt(raw.substring(0, 2), 16)

    let decoderMethod: DecoderMethod<MetadataV14StorageEntryType, Network>
    switch (prefix) {
      case StorageEntryType.Plain:
        decoderMethod = MetadataV14StorageEntryPlain.decode
        break
      case StorageEntryType.Map:
        decoderMethod = MetadataV14StorageEntryMap.decode
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

  public abstract decorate(palletName: string, prefix: string): SubstrateStorageEntry
}

export class MetadataV14StorageEntryPlain extends MetadataV14StorageEntryType {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14StorageEntryPlain> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const id = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: id.bytesDecoded,
      decoded: new MetadataV14StorageEntryPlain(id.decoded)
    }
  }

  protected readonly type = SCALEEnum.from(StorageEntryType.Plain)
  protected readonly _scaleFields = [this.id]

  private constructor(readonly id: SCALECompactInt) {
    super()
  }

  public decorate(palletName: string, prefix: string): SubstrateStorageEntry {
    return new SubstratePlainStorageEntry(palletName, prefix)
  }
}

export class MetadataV14StorageEntryMap extends MetadataV14StorageEntryType {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14StorageEntryMap> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const hashers = decoder.decodeNextArray((_network, _runtimeVersion, hex) =>
      SCALEEnum.decode(hex, (value) => SubstrateStorageEntryHasher[SubstrateStorageEntryHasher[value]])
    )
    const key = decoder.decodeNextCompactInt()
    const value = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: key.bytesDecoded + hashers.bytesDecoded + value.bytesDecoded,
      decoded: new MetadataV14StorageEntryMap(hashers.decoded, key.decoded, value.decoded)
    }
  }

  protected readonly type = SCALEEnum.from(StorageEntryType.Map)
  protected readonly _scaleFields = [this.hashers, this.key, this.value]

  private constructor(
    readonly hashers: SCALEArray<SCALEEnum<SubstrateStorageEntryHasher>>,
    readonly key: SCALECompactInt,
    readonly value: SCALECompactInt
  ) {
    super()
  }

  public decorate(palletName: string, prefix: string): SubstrateStorageEntry {
    return new SubstrateNMapStorageEntry(
      palletName,
      prefix,
      this.hashers.elements.map((hasher) => hasher.value)
    )
  }
}
