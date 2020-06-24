// tslint:disable: max-classes-per-file
import { MichelineDataNode, MichelinePrimitiveApplication } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

import { MichelsonData } from './MichelsonData'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { Lazy } from './Lazy'

export type MichelsonOptionType = 'Some' | 'None'

export abstract class MichelsonOption extends MichelsonTypeMapping {
  protected abstract type: MichelsonOptionType

  public static from(...args: unknown[]): MichelsonOption {
    if (typeof args[1] !== 'function') {
      throw new Error('MichelsonOption: unknown generic mapping factory function.')
    }

    return isMichelinePrimitiveApplication(args[0])
      ? this.fromMicheline(args[0], args[1])
      : this.fromUnknown(args[0], args[1])
  }

  public static fromMicheline(micheline: MichelinePrimitiveApplication<MichelsonData>, mappingFunction: Function): MichelsonOption {
    return this.fromUnknown(micheline.prim === 'Some' && micheline.args ? micheline.args[0] : null, mappingFunction)
  }

  public static fromUnknown(unknownValue: unknown, mappingFunction: Function): MichelsonOption {
    if (unknownValue === undefined || unknownValue === null) {
      return new MichelsonNone()
    }

    const lazyValue: Lazy<MichelsonTypeMapping> = unknownValue instanceof MichelsonTypeMapping
      ? new Lazy(() => unknownValue)
      : new Lazy(() => {
          const value: unknown = mappingFunction(unknownValue)

          if (!(value instanceof MichelsonTypeMapping)) {
            throw new Error('MichelsonOption: unknown generic mapping type.')
          }

          return value
        })

    return new MichelsonSome(lazyValue)
  }
}

export class MichelsonSome extends MichelsonOption {
  protected type: MichelsonOptionType = 'Some'

  constructor(readonly value: Lazy<MichelsonTypeMapping>) {
    super()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Some',
      args: [
        this.value.get().toMichelineJSON()
      ]
    }
  }

  public eval(): void {
    this.value.get()
  }
}

export class MichelsonNone extends MichelsonOption {
  protected type: MichelsonOptionType = 'None'

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'None'
    }
  }
}

