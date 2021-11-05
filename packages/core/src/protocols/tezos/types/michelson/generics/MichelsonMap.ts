import { Lazy } from '../../../../../data/Lazy'
import { InvalidValueError } from '../../../../../errors'
import { Domain } from '../../../../../errors/coinlib-error'
import { MichelineDataNode, MichelineNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication, isMichelineSequence } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export class MichelsonMap extends MichelsonType {
  constructor(public readonly entries: [Lazy<MichelsonType>, Lazy<MichelsonType>][], name?: string) {
    super(name)
  }

  public static from(value: unknown, keyMappingFunction?: unknown, valueMappingFunction?: unknown, name?: string): MichelsonMap {
    if (value instanceof MichelsonMap) {
      return value
    }

    if (!(value instanceof MichelsonType) && (typeof keyMappingFunction !== 'function' || typeof valueMappingFunction !== 'function')) {
      throw new InvalidValueError(Domain.TEZOS, 'MichelsonMap: unknown generic mapping factory function.')
    }

    if (isMichelineSequence(value)) {
      return MichelsonMap.fromMicheline(value, keyMappingFunction, valueMappingFunction, name)
    } else {
      return MichelsonMap.fromUnknown(value, keyMappingFunction, valueMappingFunction, name)
    }
  }

  public static fromMicheline(
    micheline: MichelineNode,
    keyMappingFunction: unknown,
    valueMappingFunction: unknown,
    name?: string
  ): MichelsonMap {
    if (!Array.isArray(micheline)) {
      throw new InvalidValueError(Domain.TEZOS, 'MichelsonMap: unknown Micheline value')
    }

    const entries = micheline
      .filter((node) => isMichelinePrimitiveApplication(node))
      .map((primitiveApplication) =>
        this.createMapEntry(
          primitiveApplication as MichelinePrimitiveApplication<MichelsonGrammarData>,
          keyMappingFunction,
          valueMappingFunction,
          name
        )
      )

    return new MichelsonMap(entries)
  }

  public static fromUnknown(
    unknownValue: unknown,
    keyMappingFunction: unknown,
    valueMappingFunction: unknown,
    name?: string
  ): MichelsonMap {
    let entries: [unknown, unknown][] | undefined
    if (unknownValue instanceof Map) {
      entries = Array.from(unknownValue.entries())
    } else if (typeof unknownValue === 'object') {
      entries = Object.entries(unknownValue as any)
    }

    if (!entries) {
      throw new InvalidValueError(Domain.TEZOS, 'MichesonMap: unknown map value')
    }

    return new MichelsonMap(entries.map((entry) => MichelsonMap.createMapEntry(entry, keyMappingFunction, valueMappingFunction, name)))
  }

  private static createMapEntry(
    michelineOrPair: MichelinePrimitiveApplication<MichelsonGrammarData> | [unknown, unknown],
    keyMappingFunction: unknown,
    valueMappingFunction: unknown,
    name?: string
  ): [Lazy<MichelsonType>, Lazy<MichelsonType>] {
    let args: [unknown, unknown]
    if (Array.isArray(michelineOrPair)) {
      args = michelineOrPair
    } else {
      if (!michelineOrPair.args) {
        throw new InvalidValueError(Domain.TEZOS, 'MichelsonMap: missing arguments')
      }
      args = [michelineOrPair.args[0], michelineOrPair.args[1]]
    }

    const keyLazy: Lazy<MichelsonType> = new Lazy(() => {
      const key: unknown = typeof keyMappingFunction === 'function' ? keyMappingFunction(args[0]) : undefined

      if (!(key instanceof MichelsonType)) {
        throw new InvalidValueError(Domain.TEZOS, 'MichelsonMap: unknown generic key mapping type.')
      }

      return key
    })

    const valueLazy: Lazy<MichelsonType> = new Lazy(() => {
      const value: unknown = typeof valueMappingFunction === 'function' ? valueMappingFunction(args[1]) : undefined

      if (!(value instanceof MichelsonType)) {
        throw new InvalidValueError(Domain.TEZOS, 'MichelsonMap: unknown generic value mapping type.')
      }

      return value
    })

    return [keyLazy, valueLazy]
  }

  public asRawValue(): Record<string, Map<unknown, unknown>> | Map<unknown, unknown> {
    const entries: [unknown, unknown][] = this.entries.map((entry) => [entry[0].get().asRawValue(), entry[1].get().asRawValue()])
    const map = new Map(entries)

    return this.name ? { [this.name]: map } : map
  }

  public toMichelineJSON(): MichelineDataNode {
    return this.entries.map((entry) => {
      return {
        prim: 'Elt',
        args: [entry[0].get().toMichelineJSON(), entry[1].get().toMichelineJSON()]
      }
    })
  }

  public eval(): void {
    this.entries.forEach((entry) => {
      entry[0].get()
      entry[1].get()
    })
  }
}
