import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode } from '../micheline/MichelineNode'

import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonList extends MichelsonTypeMapping {
  constructor(readonly elements: MichelsonTypeMapping[]) {
    super()
  }

  public static from(...args: unknown[]): MichelsonList {
    if (!Array.isArray(args[0])) {
      throw invalidArgumentTypeError('MichelsonList', 'array', typeof args[0])
    }

    if (typeof args[1] !== 'function') {
      throw new Error('MichelsonList: unknown generic mapping factory function.')
    }

    const mappingFunction: Function = args[1]

    const elements: unknown[] = args[0].map((element: unknown) => {
      return element instanceof MichelsonTypeMapping ? element : mappingFunction(element)
    })

    if (elements.some((element: unknown) => !(element instanceof MichelsonTypeMapping))) {
      throw new Error('MichelsonList: unknown generic mapping type.')
    }

    return new MichelsonList(elements as MichelsonTypeMapping[])
  }

  public toMichelineJSON(): MichelineDataNode {
    return this.elements.map((element: MichelsonTypeMapping) => element.toMichelineJSON())
  }
}