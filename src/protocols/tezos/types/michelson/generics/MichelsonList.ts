import { Lazy } from '../../../../../data/Lazy'
import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode } from '../../micheline/MichelineNode'
import { MichelsonType } from '../MichelsonType'

export class MichelsonList extends MichelsonType {
  constructor(public readonly elements: Lazy<MichelsonType[]>, name?: string) {
    super(name)
  }

  public static from(value: unknown, mappingFunction?: unknown): MichelsonList {
    if (value instanceof MichelsonList) {
      return value
    }

    if (!Array.isArray(value)) {
      throw invalidArgumentTypeError('MichelsonList', 'array', typeof value)
    }

    if (value.some((item: unknown) => !(item instanceof MichelsonType)) && typeof mappingFunction !== 'function') {
      throw new Error('MichelsonList: unknown generic mapping factory function.')
    }

    const lazyList: Lazy<MichelsonType[]> = new Lazy(() => {
      const elements: unknown[] = value.map((element: unknown) => {
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

  public asRawValue(): Record<string, Record<string, any>[]> | Record<string, any>[] {
    const value: any[] = this.elements.get().map((element: MichelsonType) => element.asRawValue())

    return this.name ? { [this.name]: value } : value
  }

  public toMichelineJSON(): MichelineDataNode {
    return this.elements.get().map((element: MichelsonType) => element.toMichelineJSON())
  }

  public eval(): void {
    this.elements.get()
  }
}