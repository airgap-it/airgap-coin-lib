// tslint:disable: max-classes-per-file

import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineDataNode } from '../micheline/MichelineNode'
import { invalidArgumentTypeError } from '../../../../utils/error'

export type MichelsonOrType = 'Left' | 'Right'

export abstract class MichelsonOr extends MichelsonTypeMapping {
  protected abstract type: MichelsonOrType

  public static from(...args: unknown[]): MichelsonOr {
    if (!(args[0] instanceof MichelsonOr) && (!Array.isArray(args[0]) || args[0].length !== 2 || typeof args[0][0] !== 'string')) {
      throw invalidArgumentTypeError('MichelsonOr', "MichelsonOr or tuple<'Left' | 'Right', any>", `${typeof args[0]}: ${args[0]}`)
    }

    if (args[0] instanceof MichelsonOr) {
      return args[0]
    }

    if (typeof args[1] !== 'function' || typeof args[2] !== 'function') {
      throw new Error('MichelsonPair: unknown generic mapping factory functions.')
    }

    const type: string = args[0][0]
    if (type.toLowerCase() === 'left' || type.toLowerCase() === 'l') {
      return this.create('Left', args[0][1], args[1])
    } else if (type.toLowerCase() === 'right' || type.toLowerCase() === 'r') {
      return this.create('Right', args[0][1], args[2])
    } else {
      throw new Error(`MichelsonOr: unknown type ${args[0][0]}, expected 'Left' or 'Right'.`)
    }
  }

  private static create(type: MichelsonOrType, value: unknown, mappingFunction: Function): MichelsonOr {
    const mappedValue: unknown = value instanceof MichelsonTypeMapping ? value : mappingFunction(value)

    if (!(mappedValue instanceof MichelsonTypeMapping)) {
      throw new Error('MichelsonOr: unknown generic mapping type.')
    }

    return type === 'Left' ? new MichelsonLeft(mappedValue) : new MichelsonRight(mappedValue)
  }

  constructor(readonly value: MichelsonTypeMapping) {
    super()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: this.type,
      args: [
        this.value.toMichelineJSON()
      ]
    }
  }
}

export class MichelsonLeft extends MichelsonOr {
  protected readonly type = 'Left'
}

export class MichelsonRight extends MichelsonOr {
  protected readonly type = 'Right'
}