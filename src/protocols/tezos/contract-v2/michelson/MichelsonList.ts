import { Lazy } from '../../../../data/Lazy'
import { invalidArgumentTypeError } from '../../../../utils/error'
import { MichelineDataNode } from '../micheline/MichelineNode'

import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export class MichelsonList extends MichelsonTypeMapping {
  constructor(readonly elements: Lazy<MichelsonTypeMapping[]>) {
    super()
  }

  public static from(items: unknown, mappingFunction: unknown): MichelsonList {
    if (!Array.isArray(items)) {
      throw invalidArgumentTypeError('MichelsonList', 'array', typeof items)
    }

    if (typeof mappingFunction !== 'function') {
      throw new Error('MichelsonList: unknown generic mapping factory function.')
    }

    const lazyList: Lazy<MichelsonTypeMapping[]> = new Lazy(() => {
      const elements: unknown[] = items.map((element: unknown) => {
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