// tslint:disable: max-classes-per-file

import { MichelineTypeNode } from '../../types/micheline/MichelineNode'
import { MichelsonGrammarType } from '../../types/michelson/grammar/MichelsonGrammarType'
import { isMichelinePrimitiveApplication } from '../utils'

import { michelsonTypeFactories } from './factories'
import { MichelsonType } from './MichelsonType'

export enum MichelsonAnnotationPrefix {
  ARG = ':',
  ENTRYPOINT = '%'
}

export interface MichelsonTypeMetaCreateValueConfiguration {
  lazyEval?: boolean

  beforeNext?: (meta: MichelsonTypeMeta, raw: unknown) => void
  onNext?: (meta: MichelsonTypeMeta, raw: unknown, value: MichelsonType) => void
}

export class MichelsonTypeMeta {
  public static fromMichelineNode(node: MichelineTypeNode): MichelsonTypeMeta | undefined {
    if (!isMichelinePrimitiveApplication(node)) {
      return undefined
    }

    const argsMeta: MichelsonTypeMeta[] = node.args 
      ? node.args
          .map((arg: MichelineTypeNode) => this.fromMichelineNode(arg))
          .filter((meta: MichelsonTypeMeta | undefined) => meta !== undefined) as MichelsonTypeMeta[]
      : []

    return this.from(node.prim, node.annots || [], argsMeta)
  }

  public static from(type: MichelsonGrammarType, annots: string[], argsMeta: MichelsonTypeMeta[]): MichelsonTypeMeta {
    return argsMeta.length === 0 ? new MichelsonTypeMeta(type, annots) : new MichelsonGenericTypeMeta(type, argsMeta, annots)
  }

  constructor(readonly type: MichelsonGrammarType, readonly annots: string[] = []) {}

  public createValue(value: unknown, configuration: MichelsonTypeMetaCreateValueConfiguration = {}): MichelsonType {
    if (value instanceof MichelsonType) {
      return value
    }

    const raw: unknown = this.getRawValue(value)

    if (configuration.beforeNext) {
      configuration.beforeNext(this, raw)
    }

    const michelsonValue: MichelsonType = michelsonTypeFactories[this.type](raw)

    if (!(configuration.lazyEval ?? true)) {
      michelsonValue.eval()
    }

    if (configuration.onNext) {
      configuration.onNext(this, raw, michelsonValue)
    }

    return michelsonValue
  }

  public getAnnotation(prefix: MichelsonAnnotationPrefix): string | undefined {
    const annotation: string | undefined = this.annots.find((annot: string) => annot.startsWith(prefix))

    return annotation?.slice(prefix.length)
  }

  protected getRawValue(value: unknown): unknown {
    const argName: string | undefined = this.getAnnotation(MichelsonAnnotationPrefix.ARG)

    return value instanceof Object && argName && argName in value
      ? value[argName]
      : value
  }
}

export class MichelsonGenericTypeMeta extends MichelsonTypeMeta {
  constructor(type: MichelsonGrammarType, readonly generics: MichelsonTypeMeta[], annots: string[] = []) {
    super(type, annots)
  }

  public createValue(value: unknown, configuration: MichelsonTypeMetaCreateValueConfiguration): MichelsonType {
    if (value instanceof MichelsonType) {
      return value
    }

    const raw: unknown = this.getRawValue(value)

    if (configuration.beforeNext) {
      configuration.beforeNext(this, raw)
    }

    const genericFactories: ((genericValue: unknown) => MichelsonType)[] = 
      this.generics.map((genericMeta: MichelsonTypeMeta) => {
        return (genericValue: unknown): MichelsonType => genericMeta.createValue(genericValue, configuration)
      })

    const michelsonValue: MichelsonType = michelsonTypeFactories[this.type](raw, ...genericFactories)

    if (!(configuration.lazyEval ?? true)) {
      michelsonValue.eval()
    }

    if (configuration.onNext) {
      configuration.onNext(this, raw, michelsonValue)
    }

    return michelsonValue
  }
}