import { MichelsonTypeMapping } from './MichelsonTypeMapping'
// tslint:disable: max-classes-per-file

import { MichelineDataNode } from '../micheline/MichelineNode'

export type MichelsonOptionType = 'Some' | 'None'

export abstract class MichelsonOption extends MichelsonTypeMapping {
  protected abstract type: MichelsonOptionType

  public static from(...args: unknown[]): MichelsonOption {
    if (args[0] === undefined || args[0] === null) {
      return new MichelsonNone()
    }

    if (!(args[1] instanceof Function)) {
      throw new Error('MichelsonPair: unknown generic mapping factory function.')
    }

    const value: unknown = args[0] instanceof MichelsonTypeMapping ? args[0] : args[1](args[0])

    if (!(value instanceof MichelsonTypeMapping)) {
      throw new Error('MichelsonPair: unknown generic mapping type.')
    }

    return new MichelsonSome(value)
  }
}

export class MichelsonSome extends MichelsonOption {
  protected type: MichelsonOptionType = 'Some'

  constructor(readonly value: MichelsonTypeMapping) {
    super()
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Some',
      args: [
        this.value.toMichelineJSON()
      ]
    }
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

