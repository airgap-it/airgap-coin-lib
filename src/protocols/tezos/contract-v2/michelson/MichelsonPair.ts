import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineNode } from '../micheline/MichelineNode'
import { invalidArgumentTypeError } from '../../../../utils/error'

export class MichelsonPair extends MichelsonTypeMapping {

  public static from(...args: unknown[]): MichelsonPair {
    if (!(args[0] instanceof Object) && (!Array.isArray(args[0]) || args[0].length !== 2)) {
      throw invalidArgumentTypeError('MichelsonPair', 'tuple or object', `${typeof args[0]}: ${args[0]}`)
    }

    if (typeof args[1] !== 'function' || typeof args[2] !== 'function') {
      throw new Error('MichelsonPair: unkown generic mapping factory functions.')
    }

    const [first, second]: [unknown, unknown] = Array.isArray(args[0]) 
      ? this.getPairfromTuple(args[0] as [unknown, unknown], args[1], args[2])
      : this.getPairFromObject(args[0], args[1], args[2])

    if (!(first instanceof MichelsonTypeMapping) || !(second instanceof MichelsonTypeMapping)) {
      throw new Error('MichelsonPair: unkown generic mapping type.')
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

  constructor(readonly first: MichelsonTypeMapping, readonly second: MichelsonTypeMapping) {
    super()
  }

  public toMichelineJSON(): MichelineNode {
    return {
      prim: 'pair',
      args: [
        this.first.toMichelineJSON(),
        this.second.toMichelineJSON()
      ]
    }
  }
}