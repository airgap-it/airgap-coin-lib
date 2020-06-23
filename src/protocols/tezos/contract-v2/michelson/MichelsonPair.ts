import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

import { MichelsonData } from './MichelsonData'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonPair extends MichelsonTypeMapping {
  constructor(readonly first: MichelsonTypeMapping, readonly second: MichelsonTypeMapping) {
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

    const [first, second]: [unknown, unknown] = Array.isArray(unknownValue) 
      ? this.getPairfromTuple(unknownValue as [unknown, unknown], firstMappingFunction, secondMappingFunction)
      : this.getPairFromObject(unknownValue, firstMappingFunction, secondMappingFunction)

    if (!(first instanceof MichelsonTypeMapping) || !(second instanceof MichelsonTypeMapping)) {
      throw new Error('MichelsonPair: unknown generic mapping type.')
    }

    return new MichelsonPair(first, second)
  }

  private static getPairfromTuple(pair: [unknown, unknown], firstFactory: Function, secondFactory: Function): [unknown, unknown] {
    const first: unknown = pair instanceof MichelsonTypeMapping ? pair[0] : firstFactory(pair[0])
    const second: unknown = pair instanceof MichelsonTypeMapping ? pair[1] : secondFactory(pair[1])

    return [first, second]
  }

  private static getPairFromObject(object: unknown, firstFactory: Function, secondFactory: Function): [unknown, unknown] {
    const first: unknown = firstFactory(object)
    const second: unknown = secondFactory(object)

    return [first, second]
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Pair',
      args: [
        this.first.toMichelineJSON(),
        this.second.toMichelineJSON()
      ]
    }
  }
}