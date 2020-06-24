import { Lazy } from '../../../../data/Lazy'
import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

import { MichelsonData } from './MichelsonData'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonPair extends MichelsonTypeMapping {
  constructor(readonly first: Lazy<MichelsonTypeMapping>, readonly second: Lazy<MichelsonTypeMapping>) {
    super()
  }

  public static from(pair: MichelsonTypeMapping | unknown, firstMappingFunction?: unknown, secondMappingFunction?: unknown): MichelsonPair {
    if (!(pair instanceof MichelsonTypeMapping) && typeof firstMappingFunction !== 'function' || typeof secondMappingFunction !== 'function') {
      throw new Error('MichelsonPair: unknown generic mapping factory functions.')
    }

    return isMichelinePrimitiveApplication(pair)
      ? this.fromMicheline(pair, firstMappingFunction, secondMappingFunction)
      : this.fromUnknown(pair, firstMappingFunction, secondMappingFunction)
  }

  public static fromMicheline(
    micheline: MichelinePrimitiveApplication<MichelsonData>,
    firstMappingFunction: unknown, 
    secondMappingFunction: unknown
  ): MichelsonPair {
    if (micheline.prim !== 'Pair') {
      throw invalidArgumentTypeError('MichelsonPair', 'prim: Pair', `prim: ${micheline.prim}`)
    }

    if (micheline.args === undefined || micheline.args.length !== 2) {
      throw invalidArgumentTypeError('MichelsonPair', 'args: <tuple>', 'args: undefined | <array>')
    }
    
    return this.fromUnknown(micheline.args, firstMappingFunction, secondMappingFunction)
  }

  public static fromUnknown(
    unknownValue: MichelsonTypeMapping | unknown, 
    firstMappingFunction: unknown, 
    secondMappingFunction: unknown
  ): MichelsonPair {
    if (!(unknownValue instanceof Object) && (!Array.isArray(unknownValue) || unknownValue.length !== 2)) {
      throw invalidArgumentTypeError('MichelsonPair', 'tuple or object', `${typeof unknownValue}: ${unknownValue}`)
    }

    const [first, second]: [Lazy<MichelsonTypeMapping>, Lazy<MichelsonTypeMapping>] = Array.isArray(unknownValue) 
      ? [this.getValue(unknownValue[0], firstMappingFunction), this.getValue(unknownValue[1], secondMappingFunction)]
      : [this.getValue(unknownValue, firstMappingFunction), this.getValue(unknownValue, secondMappingFunction)]

    return new MichelsonPair(first, second)
  }

  private static getValue(unknownValue: unknown, mappingFactory: unknown): Lazy<MichelsonTypeMapping> {
    return unknownValue instanceof MichelsonTypeMapping
      ? new Lazy(() => unknownValue)
      : new Lazy(() => {
        const value: unknown = typeof mappingFactory === 'function' ? mappingFactory(unknownValue) : undefined

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