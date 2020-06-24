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

  values: unknown | unknown[]
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

  public createValue(configuration: MichelsonTypeMetaCreateValueConfiguration): MichelsonType {
    const values: unknown[] = Array.isArray(configuration.values) ? configuration.values : [configuration.values]

    if (values[0] instanceof MichelsonType) {
      return values[0]
    }

    const raw: unknown = this.getRawValue(values)

    if (configuration.beforeNext) {
      configuration.beforeNext(this, raw)
    }

    const value: MichelsonType = michelsonTypeFactories[this.type](raw)

    if (!(configuration.lazyEval ?? true)) {
      value.eval()
    }

    if (configuration.onNext) {
      configuration.onNext(this, raw, value)
    }

    return value
  }

  public getAnnotation(prefix: MichelsonAnnotationPrefix): string | undefined {
    const annotation: string | undefined = this.annots.find((annot: string) => annot.startsWith(prefix))

    return annotation?.slice(prefix.length)
  }

  protected getRawValue(values: unknown[]): unknown {
    const argName: string | undefined = this.getAnnotation(MichelsonAnnotationPrefix.ARG)

    return values[0] instanceof Object && argName && argName in values[0]
      ? values[0][argName]
      : values[0]
  }
}

export class MichelsonGenericTypeMeta extends MichelsonTypeMeta {
  constructor(type: MichelsonGrammarType, readonly generics: MichelsonTypeMeta[], annots: string[] = []) {
    super(type, annots)
  }

  public createValue(configuration: MichelsonTypeMetaCreateValueConfiguration): MichelsonType {
    const values: unknown[] = Array.isArray(configuration.values) ? configuration.values : [configuration.values]
    if (values[0] instanceof MichelsonType) {
      return values[0]
    }

    const raw: unknown = this.getRawValue(values)

    if (configuration.beforeNext) {
      configuration.beforeNext(this, raw)
    }

    const genericFactories: ((genericValue: unknown) => MichelsonType)[] = 
      this.generics.map((genericMeta: MichelsonTypeMeta) => {
        return (genericValue: unknown): MichelsonType => genericMeta.createValue({
          ...configuration,
          values: genericValue
        })
      })

    const value: MichelsonType = michelsonTypeFactories[this.type](raw, ...genericFactories)

    if (!(configuration.lazyEval ?? true)) {
      value.eval()
    }

    if (configuration.onNext) {
      configuration.onNext(this, raw, value)
    }

    return value
  }
}