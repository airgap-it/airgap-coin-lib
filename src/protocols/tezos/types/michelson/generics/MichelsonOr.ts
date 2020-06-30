// tslint:disable: max-classes-per-file
import { Lazy } from '../../../../../data/Lazy'
import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export type MichelsonOrType = 'Left' | 'Right'

export abstract class MichelsonOr extends MichelsonType {
  protected abstract type: MichelsonOrType

  constructor(public readonly value: Lazy<MichelsonType>, name?: string) {
    super(name)
  }

  public static from(or: unknown, firstMappingFunction?: unknown, secondMappingFunction?: unknown): MichelsonOr {
    if (or instanceof MichelsonOr) {
      return or
    }

    if (!(or instanceof MichelsonType) && typeof firstMappingFunction !== 'function' || typeof secondMappingFunction !== 'function') {
      throw new Error('MichelsonPair: unknown generic mapping factory functions.')
    }

    return isMichelinePrimitiveApplication(or)
      ? MichelsonOr.fromMicheline(or, firstMappingFunction, secondMappingFunction)
      : MichelsonOr.fromUnknown(or, firstMappingFunction, secondMappingFunction)
  }

  public static fromMicheline(
    micheline: MichelinePrimitiveApplication<MichelsonGrammarData>,
    firstMappingFunction: unknown, 
    secondMappingFunction: unknown
  ): MichelsonOr {
    if (!MichelsonOr.isOr(micheline)) {
      throw invalidArgumentTypeError('MichelsonOr', 'prim: Left | Right', `prim: ${micheline.prim}`)
    }

    if (micheline.args === undefined) {
      throw invalidArgumentTypeError('MichelsonOr', 'args: <array>', 'args: undefined')
    }
   
    return MichelsonOr.fromUnknown([micheline.prim, micheline.args[0]], firstMappingFunction, secondMappingFunction)
  }

  public static fromUnknown(unknownValue: unknown, firstMappingFunction: unknown, secondMappingFunction: unknown): MichelsonOr {
    if ((!Array.isArray(unknownValue) || unknownValue.length !== 2 || typeof unknownValue[0] !== 'string')) {
      throw invalidArgumentTypeError('MichelsonOr', "MichelsonOr or tuple<'Left' | 'Right', any>", `${typeof unknownValue}: ${unknownValue}`)
    }

    const type: string = unknownValue[0]
    if (type.toLowerCase() === 'left' || type.toLowerCase() === 'l') {
      return MichelsonOr.create('Left', unknownValue[1], firstMappingFunction)
    } else if (type.toLowerCase() === 'right' || type.toLowerCase() === 'r') {
      return MichelsonOr.create('Right', unknownValue[1], secondMappingFunction)
    } else {
      throw new Error(`MichelsonOr: unknown type ${unknownValue[0]}, expected 'Left' or 'Right'.`)
    }
  }

  public static isOr(unknownValue: unknown): unknownValue is MichelsonOr {
    return (
      unknownValue instanceof MichelsonOr || 
      (
        isMichelinePrimitiveApplication(unknownValue) && 
        (unknownValue.prim === 'Left' || unknownValue.prim === 'Right')
      )
    )
  }

  private static create(type: MichelsonOrType, value: unknown, mappingFunction: unknown): MichelsonOr {
    const lazyValue: Lazy<MichelsonType> = value instanceof MichelsonType
      ? new Lazy(() => value)
      : new Lazy(() => {
          const mappedValue: unknown = typeof mappingFunction === 'function' ? mappingFunction(value) : undefined

          if (!(mappedValue instanceof MichelsonType)) {
            throw new Error('MichelsonOr: unknown generic mapping type.')
          }

          return mappedValue
        })

    return type === 'Left' ? new MichelsonLeft(lazyValue) : new MichelsonRight(lazyValue)
  }

  public asRawValue(): Record<string, any> | any {
    return this.name ? { [this.name]: this.value.get().asRawValue() } : this.value.get().asRawValue()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: this.type,
      args: [
        this.value.get().toMichelineJSON()
      ]
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