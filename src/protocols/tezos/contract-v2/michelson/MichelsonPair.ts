import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

import { Lazy } from './Lazy'
import { MichelsonData } from './MichelsonData'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonPair extends MichelsonTypeMapping {
  constructor(readonly first: Lazy<MichelsonTypeMapping>, readonly second: Lazy<MichelsonTypeMapping>) {
    super()
  }

  public static from(...args: unknown[]): MichelsonPair {
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
  ): MichelsonPair {
    if (micheline.prim !== 'Pair') {
      throw invalidArgumentTypeError('MichelsonPair', 'prim: Pair', `prim: ${micheline.prim}`)
    }

    if (micheline.args === undefined || micheline.args.length !== 2) {
      throw invalidArgumentTypeError('MichelsonPair', 'args: <tuple>', 'args: undefined | <array>')
    }
    
    return this.fromUnknown(micheline.args, firstMappingFunction, secondMappingFunction)
  }

  public static fromUnknown(unknownValue: unknown, firstMappingFunction: Function, secondMappingFunction: Function): MichelsonPair {
    if (!(unknownValue instanceof Object) && (!Array.isArray(unknownValue) || unknownValue.length !== 2)) {
      throw invalidArgumentTypeError('MichelsonPair', 'tuple or object', `${typeof unknownValue}: ${unknownValue}`)
    }

    const [first, second]: [Lazy<MichelsonTypeMapping>, Lazy<MichelsonTypeMapping>] = Array.isArray(unknownValue) 
      ? [this.getValue(unknownValue[0], firstMappingFunction), this.getValue(unknownValue[1], secondMappingFunction)]
      : [this.getValue(unknownValue, firstMappingFunction), this.getValue(unknownValue, secondMappingFunction)]

    return new MichelsonPair(first, second)
  }

  private static getValue(unknownValue: unknown, mappingFactory: Function): Lazy<MichelsonTypeMapping> {
    return unknownValue instanceof MichelsonTypeMapping
      ? new Lazy(() => unknownValue)
      : new Lazy(() => {
        const value: unknown = mappingFactory(unknownValue)

        if (!(value instanceof MichelsonTypeMapping)) {
          throw new Error('MichelsonPair: unknown generic mapping type.')
        }        

        return value
      })
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Pair',
      args: [
        this.first.get().toMichelineJSON(),
        this.second.get().toMichelineJSON()
      ]
    }
  }

  public eval(): void {
    this.first.get()
    this.second.get()
  }
}