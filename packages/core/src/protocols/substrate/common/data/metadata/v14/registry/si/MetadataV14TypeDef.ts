// tslint:disable: max-classes-per-file
import { InvalidValueError } from '../../../../../../../../errors'
import { Domain } from '../../../../../../../../errors/coinlib-error'
import { SubstrateNetwork } from '../../../../../../SubstrateNetwork'
import { DecoderMethod, SCALEDecoder, SCALEDecodeResult } from '../../../../scale/SCALEDecoder'
import { SCALEArray } from '../../../../scale/type/SCALEArray'
import { SCALEClass } from '../../../../scale/type/SCALEClass'
import { SCALECompactInt } from '../../../../scale/type/SCALECompactInt'
import { SCALEEnum } from '../../../../scale/type/SCALEEnum'
import { SCALEInt } from '../../../../scale/type/SCALEInt'
import { SCALEType } from '../../../../scale/type/SCALEType'

import { MetadataV14SiField } from './MetadataV14SiField'
import { MetadataV14SiVariant } from './MetadataV14SiVariant'

enum TypeDef {
  Composite = 0,
  Variant,
  Sequence,
  Array,
  Tuple,
  Primitive,
  Compact,
  BitSequence
}

enum TypeDefPrimitive {
  Bool = 0,
  Char,
  Str,
  U8,
  U16,
  U32,
  U64,
  U128,
  U256,
  I8,
  I16,
  I32,
  I64,
  I128,
  I256
}

export abstract class MetadataV14SiTypeDef extends SCALEClass {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiTypeDef> {
    const prefix = parseInt(raw.substring(0, 2), 16)

    let decoderMethod: DecoderMethod<MetadataV14SiTypeDef, Network>
    switch (prefix) {
      case TypeDef.Composite:
        decoderMethod = MetadataV14SiCompositeTypeDef.decode
        break
      case TypeDef.Variant:
        decoderMethod = MetadataV14SiVariantTypeDef.decode
        break
      case TypeDef.Sequence:
        decoderMethod = MetadataV14SiSequenceTypeDef.decode
        break
      case TypeDef.Array:
        decoderMethod = MetadataV14SiArrayTypeDef.decode
        break
      case TypeDef.Tuple:
        decoderMethod = MetadataV14SiTupleTypeDef.decode
        break
      case TypeDef.Primitive:
        decoderMethod = MetadataV14SiPrimitiveTypeDef.decode
        break
      case TypeDef.Compact:
        decoderMethod = MetadataV14SiCompactTypeDef.decode
        break
      case TypeDef.BitSequence:
        decoderMethod = MetadataV14SiBitSequenceTypeDef.decode
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
}

export class MetadataV14SiCompositeTypeDef extends MetadataV14SiTypeDef {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiCompositeTypeDef> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const fields = decoder.decodeNextArray(MetadataV14SiField.decode)

    return {
      bytesDecoded: fields.bytesDecoded,
      decoded: new MetadataV14SiCompositeTypeDef(fields.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.fields]

  private constructor(readonly fields: SCALEArray<MetadataV14SiField>) {
    super()
  }
}

export class MetadataV14SiVariantTypeDef extends MetadataV14SiTypeDef {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiVariantTypeDef> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const variants = decoder.decodeNextArray(MetadataV14SiVariant.decode)

    return {
      bytesDecoded: variants.bytesDecoded,
      decoded: new MetadataV14SiVariantTypeDef(variants.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.variants]

  private constructor(readonly variants: SCALEArray<MetadataV14SiVariant>) {
    super()
  }
}

export class MetadataV14SiSequenceTypeDef extends MetadataV14SiTypeDef {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiSequenceTypeDef> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const type = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: type.bytesDecoded,
      decoded: new MetadataV14SiSequenceTypeDef(type.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.type]

  private constructor(readonly type: SCALECompactInt) {
    super()
  }
}

export class MetadataV14SiArrayTypeDef extends MetadataV14SiTypeDef {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiArrayTypeDef> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const len = decoder.decodeNextInt(32)
    const type = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: len.bytesDecoded + type.bytesDecoded,
      decoded: new MetadataV14SiArrayTypeDef(len.decoded, type.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.len, this.type]

  private constructor(readonly len: SCALEInt, readonly type: SCALECompactInt) {
    super()
  }
}

export class MetadataV14SiTupleTypeDef extends MetadataV14SiTypeDef {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiTupleTypeDef> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const value = decoder.decodeNextArray((_network, _runtimeVersion, hex) => SCALECompactInt.decode(hex))

    return {
      bytesDecoded: value.bytesDecoded,
      decoded: new MetadataV14SiTupleTypeDef(value.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.value]

  private constructor(readonly value: SCALEArray<SCALECompactInt>) {
    super()
  }
}

export class MetadataV14SiPrimitiveTypeDef extends MetadataV14SiTypeDef {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiPrimitiveTypeDef> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const value = decoder.decodeNextEnum((value) => TypeDefPrimitive[TypeDefPrimitive[value]])

    return {
      bytesDecoded: value.bytesDecoded,
      decoded: new MetadataV14SiPrimitiveTypeDef(value.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.value]

  private constructor(readonly value: SCALEEnum<TypeDefPrimitive>) {
    super()
  }
}

export class MetadataV14SiCompactTypeDef extends MetadataV14SiTypeDef {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiCompactTypeDef> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const type = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: type.bytesDecoded,
      decoded: new MetadataV14SiCompactTypeDef(type.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.type]

  private constructor(readonly type: SCALECompactInt) {
    super()
  }
}

export class MetadataV14SiBitSequenceTypeDef extends MetadataV14SiTypeDef {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<MetadataV14SiBitSequenceTypeDef> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const bitStoreType = decoder.decodeNextCompactInt()
    const bitOrderType = decoder.decodeNextCompactInt()

    return {
      bytesDecoded: bitStoreType.bytesDecoded + bitOrderType.bytesDecoded,
      decoded: new MetadataV14SiBitSequenceTypeDef(bitStoreType.decoded, bitOrderType.decoded)
    }
  }

  protected readonly scaleFields: SCALEType[] = [this.bitStoreType, this.bitOrderType]

  private constructor(readonly bitStoreType: SCALECompactInt, readonly bitOrderType: SCALECompactInt) {
    super()
  }
}
