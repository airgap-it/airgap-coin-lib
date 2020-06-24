// tslint:disable: max-classes-per-file

import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

import { Lazy } from './Lazy'
import { MichelsonData } from './MichelsonData'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export type MichelsonOrType = 'Left' | 'Right'

export abstract class MichelsonOr extends MichelsonTypeMapping {
  protected abstract type: MichelsonOrType

  constructor(readonly value: Lazy<MichelsonTypeMapping>) {
    super()
  }

  public static from(...args: unknown[]): MichelsonOr {
    if (typeof args[1] !== 'function' || typeof args[2] !== 'function') {
      throw new Error('MichelsonPair: unknown generic mapping factory functions.')
    }

    return isMichelinePrimitiveApplication(args[0])
      ? this.fromMicheline(args[0], args[1], args[2])
      : this.fromUnknown(args[0], args[1], args[2])
  }

  public static fromMicheline(
    micheline: MichelinePrimitiveApplication<MichelsonData>,
    firstMappingFunction: Function, 
    secondMappingFunction: Function
  ): MichelsonOr {
    if (!this.isOr(micheline)) {
      throw invalidArgumentTypeError('MichelsonOr', 'prim: Left | Right', `prim: ${micheline.prim}`)
    }

    if (micheline.args === undefined) {
      throw invalidArgumentTypeError('MichelsonOr', 'args: <array>', 'args: undefined')
    }
   
    return this.fromUnknown([micheline.prim, micheline.args[0]], firstMappingFunction, secondMappingFunction)
  }

  public static fromUnknown(unkownValue: unknown, firstMappingFunction: Function, secondMappingFunction: Function): MichelsonOr {
    if (
      !(unkownValue instanceof MichelsonOr) && 
      (!Array.isArray(unkownValue) || unkownValue.length !== 2 || typeof unkownValue[0] !== 'string')
    ) {
      throw invalidArgumentTypeError('MichelsonOr', "MichelsonOr or tuple<'Left' | 'Right', any>", `${typeof unkownValue}: ${unkownValue}`)
    }

    if (unkownValue instanceof MichelsonOr) {
      return unkownValue
    }

    const type: string = unkownValue[0]
    if (type.toLowerCase() === 'left' || type.toLowerCase() === 'l') {
      return this.create('Left', unkownValue[1], firstMappingFunction)
    } else if (type.toLowerCase() === 'right' || type.toLowerCase() === 'r') {
      return this.create('Right', unkownValue[1], secondMappingFunction)
    } else {
      throw new Error(`MichelsonOr: unknown type ${unkownValue[0]}, expected 'Left' or 'Right'.`)
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

  private static create(type: MichelsonOrType, value: unknown, mappingFunction: Function): MichelsonOr {
    const lazyValue: Lazy<MichelsonTypeMapping> = value instanceof MichelsonTypeMapping
      ? new Lazy(() => value)
      : new Lazy(() => {
          const mappedValue: unknown = mappingFunction(value)

          if (!(mappedValue instanceof MichelsonTypeMapping)) {
            throw new Error('MichelsonOr: unknown generic mapping type.')
          }

          return mappedValue
        })

    return type === 'Left' ? new MichelsonLeft(lazyValue) : new MichelsonRight(lazyValue)
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