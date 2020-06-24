// tslint:disable: max-classes-per-file

import { MichelineTypeNode } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

import { MichelsonType, michelsonTypeFactories } from './MichelsonType'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

export const META_ANNOTATION_PREFIX_ARG = ':'
export const META_ANNOTATION_PREFIX_ENTRYPOINT = '%'

export interface MichelsonTypeMetaCreateValueConfiguration {
  lazyEval?: boolean

  beforeNext?: (meta: MichelsonTypeMeta, raw: unknown) => void
  onNext?: (meta: MichelsonTypeMeta, raw: unknown, value: MichelsonTypeMapping) => void

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

  public static from(type: MichelsonType, annots: string[], argsMeta: MichelsonTypeMeta[]): MichelsonTypeMeta {
    return argsMeta.length === 0 ? new MichelsonTypeMeta(type, annots) : new MichelsonGenericTypeMeta(type, argsMeta, annots)
  }

  constructor(readonly type: MichelsonType, readonly annots: string[] = []) {}

  public createValue(configuration: MichelsonTypeMetaCreateValueConfiguration): MichelsonTypeMapping {
    const values: unknown[] = Array.isArray(configuration.values) ? configuration.values : [configuration.values]

    if (values[0] instanceof MichelsonTypeMapping) {
      return values[0]
    }

    const raw: unknown = this.getRawValue(values)

    if (configuration.beforeNext) {
      configuration.beforeNext(this, raw)
    }

    const value: MichelsonTypeMapping = michelsonTypeFactories[this.type](raw)

    if (!(configuration.lazyEval ?? true)) {
      value.eval()
    }

    if (configuration.onNext) {
      configuration.onNext(this, raw, value)
    }

    return value
  }

  public getAnnotation(prefix: string): string | undefined {
    const annotation: string | undefined = this.annots.find((annot: string) => annot.startsWith(prefix))

    return annotation?.slice(prefix.length)
  }

  protected getRawValue(values: unknown[]): unknown {
    const argName: string | undefined = this.getAnnotation(META_ANNOTATION_PREFIX_ARG)

    return values[0] instanceof Object && argName && argName in values[0]
      ? values[0][argName]
      : values[0]
  }
}

export class MichelsonGenericTypeMeta extends MichelsonTypeMeta {
  constructor(type: MichelsonType, readonly generics: MichelsonTypeMeta[], annots: string[] = []) {
    super(type, annots)
  }

  public createValue(configuration: MichelsonTypeMetaCreateValueConfiguration): MichelsonTypeMapping {
    const values: unknown[] = Array.isArray(configuration.values) ? configuration.values : [configuration.values]
    if (values[0] instanceof MichelsonTypeMapping) {
      return values[0]
    }

    const raw: unknown = this.getRawValue(values)

    if (configuration.beforeNext) {
      configuration.beforeNext(this, raw)
    }

    const genericFactories: ((genericValue: unknown) => MichelsonTypeMapping)[] = 
      this.generics.map((genericMeta: MichelsonTypeMeta) => {
        return (genericValue: unknown): MichelsonTypeMapping => genericMeta.createValue({
          ...configuration,
          values: genericValue
        })
      })

    const value: MichelsonTypeMapping = michelsonTypeFactories[this.type](raw, ...genericFactories)

    if (!(configuration.lazyEval ?? true)) {
      value.eval()
    }

    if (configuration.onNext) {
      configuration.onNext(this, raw, value)
    }

    return value
  }
}