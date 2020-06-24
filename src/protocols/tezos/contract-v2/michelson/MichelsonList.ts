import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode } from '../micheline/MichelineNode'

import { Lazy } from './Lazy'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonList extends MichelsonTypeMapping {
  constructor(readonly elements: Lazy<MichelsonTypeMapping[]>) {
    super()
  }

  public static from(...args: unknown[]): MichelsonList {
    if (!Array.isArray(args[0])) {
      throw invalidArgumentTypeError('MichelsonList', 'array', typeof args[0])
    }

    if (typeof args[1] !== 'function') {
      throw new Error('MichelsonList: unknown generic mapping factory function.')
    }

    const list: unknown[] = args[0]
    const mappingFunction: Function = args[1]

    const lazyList: Lazy<MichelsonTypeMapping[]> = new Lazy(() => {
      const elements: unknown[] = list.map((element: unknown) => {
        return element instanceof MichelsonTypeMapping ? element : mappingFunction(element)
      })
  
      if (elements.some((element: unknown) => !(element instanceof MichelsonTypeMapping))) {
        throw new Error('MichelsonList: unknown generic mapping type.')
      }

      return elements as MichelsonTypeMapping[]
    })

    return new MichelsonList(lazyList)
  }

  public toMichelineJSON(): MichelineDataNode {
    return this.elements.get().map((element: MichelsonTypeMapping) => element.toMichelineJSON())
  }

  public eval(): void {
    this.elements.get()
  }
}