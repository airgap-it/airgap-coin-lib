// tslint:disable: max-classes-per-file
import { Lazy } from '../../../../../data/Lazy'
import { InvalidValueError } from '../../../../../errors'
import { Domain, CoinlibAssertionError } from '../../../../../errors/coinlib-error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isAnyMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export type MichelsonOrType = 'Left' | 'Right'

const michelsonRegex = /^(?<type>(Left|Right))\s\(?(?<value>[^()]+)\)?$/

export abstract class MichelsonOr extends MichelsonType {
  protected abstract type: MichelsonOrType

  constructor(public readonly value: Lazy<MichelsonType>, name?: string) {
    super(name)
  }

  public static from(or: unknown, firstMappingFunction?: unknown, secondMappingFunction?: unknown, name?: string): MichelsonOr {
    if (or instanceof MichelsonOr) {
      return or
    }

    if ((!(or instanceof MichelsonType) && typeof firstMappingFunction !== 'function') || typeof secondMappingFunction !== 'function') {
      throw new InvalidValueError(Domain.TEZOS, 'MichelsonPair: unknown generic mapping factory functions.')
    }

    if (isAnyMichelinePrimitiveApplication(or)) {
      return MichelsonOr.fromMicheline(or, firstMappingFunction, secondMappingFunction, name)
    } else if (typeof or === 'string' && or.match(michelsonRegex)) {
      return MichelsonOr.fromMichelson(or, firstMappingFunction, secondMappingFunction, name)
    } else {
      return MichelsonOr.fromUnknown(or, firstMappingFunction, secondMappingFunction, name)
    }
  }

  public static fromMichelson(
    michelson: string,
    firstMappingFunction: unknown,
    secondMappingFunction: unknown,
    name?: string
  ): MichelsonOr {
    const match: RegExpMatchArray | null = michelson.match(michelsonRegex)
    if (match === null || match.groups?.type === undefined || match.groups?.value === undefined) {
      throw new Error('MichelsonOr: invalid Michelson value')
    }

    return MichelsonOr.fromUnknown([match.groups?.type, match.groups?.value], firstMappingFunction, secondMappingFunction, name)
  }

  public static fromMicheline(
    micheline: MichelinePrimitiveApplication<MichelsonGrammarData>,
    firstMappingFunction: unknown,
    secondMappingFunction: unknown,
    name?: string
  ): MichelsonOr {
    if (!MichelsonOr.isOr(micheline)) {
      throw new CoinlibAssertionError(Domain.TEZOS, 'MichelsonOr', 'prim: Left | Right', `prim: ${micheline.prim}`)
    }

    if (micheline.args === undefined) {
      throw new CoinlibAssertionError(Domain.TEZOS, 'MichelsonOr', 'args: <array>', 'args: undefined')
    }

    return MichelsonOr.fromUnknown([micheline.prim, micheline.args[0]], firstMappingFunction, secondMappingFunction, name)
  }

  public static fromUnknown(
    unknownValue: unknown,
    firstMappingFunction: unknown,
    secondMappingFunction: unknown,
    name?: string
  ): MichelsonOr {
    if (!Array.isArray(unknownValue) || unknownValue.length !== 2 || typeof unknownValue[0] !== 'string') {
      throw new CoinlibAssertionError(
        Domain.TEZOS,
        'MichelsonOr',
        "MichelsonOr or tuple<'Left' | 'Right', any>",
        `${typeof unknownValue}: ${unknownValue}`
      )
    }

    const type: string = unknownValue[0]
    if (type.toLowerCase() === 'left' || type.toLowerCase() === 'l') {
      return MichelsonOr.create('Left', unknownValue[1], firstMappingFunction, name)
    } else if (type.toLowerCase() === 'right' || type.toLowerCase() === 'r') {
      return MichelsonOr.create('Right', unknownValue[1], secondMappingFunction, name)
    } else {
      throw new CoinlibAssertionError(Domain.TEZOS, 'MichelsonOr', "'Left' or 'Right'", unknownValue[0])
    }
  }

  public static isOr(unknownValue: unknown): unknownValue is MichelsonOr {
    return (
      unknownValue instanceof MichelsonOr ||
      (isAnyMichelinePrimitiveApplication(unknownValue) && (unknownValue.prim === 'Left' || unknownValue.prim === 'Right'))
    )
  }

  private static create(type: MichelsonOrType, value: unknown, mappingFunction: unknown, name?: string): MichelsonOr {
    const lazyValue: Lazy<MichelsonType> =
      value instanceof MichelsonType
        ? new Lazy(() => value)
        : new Lazy(() => {
            const mappedValue: unknown = typeof mappingFunction === 'function' ? mappingFunction(value) : undefined

            if (!(mappedValue instanceof MichelsonType)) {
              throw new InvalidValueError(Domain.TEZOS, 'MichelsonOr: unknown generic mapping type.')
            }

            return mappedValue
          })

    return type === 'Left' ? new MichelsonLeft(lazyValue, name) : new MichelsonRight(lazyValue, name)
  }

  public asRawValue(): Record<string, any> | any {
    return this.name ? { [this.name]: this.value.get().asRawValue() } : this.value.get().asRawValue()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: this.type,
      args: [this.value.get().toMichelineJSON()]
    }
  }

  public eval(): void {
    this.value.get()
  }
}

export class MichelsonLeft extends MichelsonOr {
  protected readonly type = 'Left'
}

export class MichelsonRight extends MichelsonOr {
  protected readonly type = 'Right'
}
