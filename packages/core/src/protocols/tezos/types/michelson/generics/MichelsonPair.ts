import { Lazy } from '../../../../../data/Lazy'
import { invalidArgumentTypeError } from '../../../../../utils/error'
import { isRecord } from '../../../../../utils/type'
import { MichelineDataNode, MichelinePrimitiveApplication, MichelineGenericNode } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'

export class MichelsonPair extends MichelsonType {
  constructor(public readonly first: Lazy<MichelsonType>, public readonly second: Lazy<MichelsonType>, name?: string) {
    super(name)
  }

  public static from(pair: unknown, firstMappingFunction?: unknown, secondMappingFunction?: unknown, name?: string): MichelsonPair {
    if (pair instanceof MichelsonPair) {
      return pair
    }

    return isMichelinePrimitiveApplication(pair)
      ? MichelsonPair.fromMicheline(pair, firstMappingFunction, secondMappingFunction, name)
      : MichelsonPair.fromUnknown(pair, firstMappingFunction, secondMappingFunction, name)
  }

  public static fromMicheline(
    micheline: MichelinePrimitiveApplication<MichelsonGrammarData>,
    firstMappingFunction: unknown,
    secondMappingFunction: unknown,
    name?: string
  ): MichelsonPair {
    if (micheline.prim !== 'Pair') {
      throw invalidArgumentTypeError('MichelsonPair', 'prim: Pair', `prim: ${micheline.prim}`)
    }

    if (micheline.args === undefined || micheline.args.length < 2) {
      throw invalidArgumentTypeError('MichelsonPair', 'args: <tuple>', 'args: undefined | <array>')
    }

    let args = this.normalizePairArgs(micheline.args)

    return MichelsonPair.fromUnknown(args, firstMappingFunction, secondMappingFunction, name)
  }

  private static normalizePairArgs(args: MichelineGenericNode<MichelsonGrammarData>[]): MichelineGenericNode<MichelsonGrammarData>[] {
    if (args.length > 2) {
      return [
        args[0],
        {
          prim: 'Pair',
          args: this.normalizePairArgs(args.slice(1))
        }
      ]
    }
    return args
  }

  public static fromUnknown(
    unknownValue: MichelsonType | unknown,
    firstMappingFunction: unknown,
    secondMappingFunction: unknown,
    name?: string
  ): MichelsonPair {
    if (!(unknownValue instanceof Object) && (!Array.isArray(unknownValue) || unknownValue.length !== 2)) {
      throw invalidArgumentTypeError('MichelsonPair', 'tuple or object', `${typeof unknownValue}: ${unknownValue}`)
    }

    const [first, second]: [Lazy<MichelsonType>, Lazy<MichelsonType>] = Array.isArray(unknownValue)
      ? [MichelsonPair.asRawValue(unknownValue[0], firstMappingFunction), MichelsonPair.asRawValue(unknownValue[1], secondMappingFunction)]
      : [MichelsonPair.asRawValue(unknownValue, firstMappingFunction), MichelsonPair.asRawValue(unknownValue, secondMappingFunction)]

    return new MichelsonPair(first, second, name)
  }

  private static asRawValue(unknownValue: unknown, mappingFactory: unknown): Lazy<MichelsonType> {
    if (!(unknownValue instanceof MichelsonType) && typeof mappingFactory !== 'function') {
      throw new Error('MichelsonPair: unknown generic mapping factory function.')
    }

    return unknownValue instanceof MichelsonType
      ? new Lazy(() => unknownValue)
      : new Lazy(() => {
        const value: unknown = typeof mappingFactory === 'function' ? mappingFactory(unknownValue) : undefined

        if (!(value instanceof MichelsonType)) {
          throw new Error('MichelsonPair: unknown generic mapping type.')
        }

        return value
      })
  }

  public asRawValue(): Record<string, any> | [any, any] {
    const first = this.first.get().asRawValue()
    const second = this.second.get().asRawValue()

    const value: Record<string, any> | [any, any] = isRecord(first) && isRecord(second)
      ? Object.assign(first, second)
      : [first, second]

    return this.name ? { [this.name]: value } : value
  }

  public toMichelineJSON(): MichelineDataNode {
    return {
      prim: 'Pair',
      args: [
        this.first.get().toMichelineJSON(),
        this.second.get().toMichelineJSON()
      ]
    }
  }

  public eval(): void {
    this.first.get()
    this.second.get()
  }
}