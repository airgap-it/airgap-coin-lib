import { Lazy } from '../../../../../data/Lazy'
import { invalidArgumentTypeError } from '../../../../../utils/error'
import { MichelineDataNode, MichelinePrimitiveApplication } from '../../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../../utils'
import { MichelsonGrammarData } from '../grammar/MichelsonGrammarData'
import { MichelsonType } from '../MichelsonType'
import { isRecord } from '../../../../../utils/type'

export class MichelsonPair extends MichelsonType {
  constructor(readonly first: Lazy<MichelsonType>, readonly second: Lazy<MichelsonType>, name?: string) {
    super(name)
  }

  public static from(pair: MichelsonType | unknown, firstMappingFunction?: unknown, secondMappingFunction?: unknown): MichelsonPair {
    if (!(pair instanceof MichelsonType) && typeof firstMappingFunction !== 'function' || typeof secondMappingFunction !== 'function') {
      throw new Error('MichelsonPair: unknown generic mapping factory functions.')
    }

    return isMichelinePrimitiveApplication(pair)
      ? this.fromMicheline(pair, firstMappingFunction, secondMappingFunction)
      : this.fromUnknown(pair, firstMappingFunction, secondMappingFunction)
  }

  public static fromMicheline(
    micheline: MichelinePrimitiveApplication<MichelsonGrammarData>,
    firstMappingFunction: unknown, 
    secondMappingFunction: unknown
  ): MichelsonPair {
    if (micheline.prim !== 'Pair') {
      throw invalidArgumentTypeError('MichelsonPair', 'prim: Pair', `prim: ${micheline.prim}`)
    }

    if (micheline.args === undefined || micheline.args.length !== 2) {
      throw invalidArgumentTypeError('MichelsonPair', 'args: <tuple>', 'args: undefined | <array>')
    }
    
    return this.fromUnknown(micheline.args, firstMappingFunction, secondMappingFunction)
  }

  public static fromUnknown(
    unknownValue: MichelsonType | unknown, 
    firstMappingFunction: unknown, 
    secondMappingFunction: unknown
  ): MichelsonPair {
    if (!(unknownValue instanceof Object) && (!Array.isArray(unknownValue) || unknownValue.length !== 2)) {
      throw invalidArgumentTypeError('MichelsonPair', 'tuple or object', `${typeof unknownValue}: ${unknownValue}`)
    }

    const [first, second]: [Lazy<MichelsonType>, Lazy<MichelsonType>] = Array.isArray(unknownValue) 
      ? [this.asRawValue(unknownValue[0], firstMappingFunction), this.asRawValue(unknownValue[1], secondMappingFunction)]
      : [this.asRawValue(unknownValue, firstMappingFunction), this.asRawValue(unknownValue, secondMappingFunction)]

    return new MichelsonPair(first, second)
  }

  private static asRawValue(unknownValue: unknown, mappingFactory: unknown): Lazy<MichelsonType> {
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