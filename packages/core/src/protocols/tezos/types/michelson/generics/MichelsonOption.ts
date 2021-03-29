// tslint:disable: max-classes-per-file

import { Lazy } from '../../../../../data/Lazy'
import { InvalidValueError } from '../../../../../errors'
import { Domain } from '../../../../../errors/coinlib-error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export type MichelsonOptionType = 'Some' | 'None'

const michelsonRegex = /^(?:(?:Some\s\(?(?<value>[^()]+)\)?)|(?:None))$/

export abstract class MichelsonOption extends MichelsonType {
  protected abstract type: MichelsonOptionType

  public static from(value: unknown, mappingFunction?: unknown, name?: string): MichelsonOption {
    if (value instanceof MichelsonOption) {
      return value
    }

    if (!(value instanceof MichelsonType) && typeof mappingFunction !== 'function') {
      throw new InvalidValueError(Domain.TEZOS, 'MichelsonPair: unknown generic factory function.')
    }

    if (isMichelinePrimitiveApplication(value)) {
      return MichelsonOption.fromMicheline(value, mappingFunction, name)
    } else if (typeof value === 'string' && value.match(michelsonRegex)) {
      return MichelsonOption.fromMichelson(value, mappingFunction, name)
    } else {
      return MichelsonOption.fromUnknown(value, mappingFunction, name)
    }
  }

  public static fromMichelson(michelson: string, mappingFunction: unknown, name?: string): MichelsonOption {
    const match: RegExpMatchArray | null = michelson.match(michelsonRegex)
    if (match === null) {
      throw new Error('MichelsonOption: invalid Michelson value')
    }

    return MichelsonOption.fromUnknown(match.groups?.value, mappingFunction, name)
  }

  public static fromMicheline(
    micheline: MichelinePrimitiveApplication<MichelsonGrammarData>,
    mappingFunction: unknown,
    name?: string
  ): MichelsonOption {
    return MichelsonOption.fromUnknown(micheline.prim === 'Some' && micheline.args ? micheline.args[0] : null, mappingFunction, name)
  }

  public static fromUnknown(unknownValue: unknown, mappingFunction: unknown, name?: string): MichelsonOption {
    if (unknownValue === undefined || unknownValue === null) {
      return new MichelsonNone(name)
    }

    const lazyValue: Lazy<MichelsonType> =
      unknownValue instanceof MichelsonType
        ? new Lazy(() => unknownValue)
        : new Lazy(() => {
            const value: unknown = typeof mappingFunction === 'function' ? mappingFunction(unknownValue) : undefined

            if (!(value instanceof MichelsonType)) {
              throw new InvalidValueError(Domain.TEZOS, 'MichelsonPair: unknown generic mapping type.')
            }

            return value
          })

    return new MichelsonSome(lazyValue, name)
  }
}

export class MichelsonSome extends MichelsonOption {
  protected type: MichelsonOptionType = 'Some'

  constructor(public readonly value: Lazy<MichelsonType>, name?: string) {
    super(name)
  }

  public asRawValue(): any {
    const value = this.value.get().asRawValue()

    return this.name ? { [this.name]: value } : value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Some',
      args: [this.value.get().toMichelineJSON()]
    }
  }

  public eval(): void {
    this.value.get()
  }
}

export class MichelsonNone extends MichelsonOption {
  protected type: MichelsonOptionType = 'None'

  public asRawValue(): Record<string, undefined> | undefined {
    return this.name ? { [this.name]: undefined } : undefined
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'None'
    }
  }
}
