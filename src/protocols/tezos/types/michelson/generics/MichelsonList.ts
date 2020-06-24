import { Lazy } from '../../../../../data/Lazy'
import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode } from '../../micheline/MichelineNode'
import { MichelsonType } from '../MichelsonType'

export class MichelsonList extends MichelsonType {
  constructor(readonly elements: Lazy<MichelsonType[]>) {
    super()
  }

  public static from(items: unknown, mappingFunction?: unknown): MichelsonList {
    if (!Array.isArray(items)) {
      throw invalidArgumentTypeError('MichelsonList', 'array', typeof items)
    }

    if (items.some((item: unknown) => !(item instanceof MichelsonType)) && typeof mappingFunction !== 'function') {
      throw new Error('MichelsonList: unknown generic mapping factory function.')
    }

    const lazyList: Lazy<MichelsonType[]> = new Lazy(() => {
      const elements: unknown[] = items.map((element: unknown) => {
        if (element instanceof MichelsonType) {
          return element
        } else {
          return typeof mappingFunction === 'function' ?  mappingFunction(element) : undefined
        }
      })
  
      if (elements.some((element: unknown) => !(element instanceof MichelsonType))) {
        throw new Error('MichelsonList: unknown generic mapping type.')
      }

      return elements as MichelsonType[]
    })

    return new MichelsonList(lazyList)
  }

  public toMichelineJSON(): MichelineDataNode {
    return this.elements.get().map((element: MichelsonType) => element.toMichelineJSON())
  }

  public eval(): void {
    this.elements.get()
  }
}