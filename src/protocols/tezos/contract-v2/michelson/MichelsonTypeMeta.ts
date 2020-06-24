// tslint:disable: max-classes-per-file

import { MichelineTypeNode } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

import { MichelsonType, michelsonTypeFactories } from './MichelsonType'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'

const ANNOTATION_PREFIX_ARG = ':'

export interface MichelsonTypeMetaValueConfiguration {
  registry?: Map<string, MichelsonTypeMapping>
  lazyEval?: boolean

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

  public createValue(configuration: MichelsonTypeMetaValueConfiguration): MichelsonTypeMapping {
    const values: unknown[] = Array.isArray(configuration.values) ? configuration.values : [configuration.values]

    if (values[0] instanceof MichelsonTypeMapping) {
      return values[0]
    }

    const raw: unknown = this.getRawValue(values)
    const value: MichelsonTypeMapping = michelsonTypeFactories[this.type](raw)
    if (!(configuration.lazyEval ?? true)) {
      value.eval()
    }

    if (configuration.registry) {
      this.saveValueInRegistry(value, configuration.registry)
    }

    return value
  }

  protected getRawValue(values: unknown[]): unknown {
    const argName: string | undefined = this.getAnnotation(ANNOTATION_PREFIX_ARG)

    return values[0] instanceof Object && argName && argName in values[0]
      ? values[0][argName]
      : values[0]
  }

  protected getAnnotation(prefix: string): string | undefined {
    const annotation: string | undefined = this.annots.find((annot: string) => annot.startsWith(prefix))

    return annotation?.slice(prefix.length)
  }

  protected saveValueInRegistry<T>(value: T, registry: Map<string, T>): void {
    const argName: string | undefined = this.getAnnotation(ANNOTATION_PREFIX_ARG)
    if (argName) {
      registry.set(argName, value)
    }
  }
}

export class MichelsonGenericTypeMeta extends MichelsonTypeMeta {
  constructor(type: MichelsonType, readonly generics: MichelsonTypeMeta[], annots: string[] = []) {
    super(type, annots)
  }

  public createValue(configuration: MichelsonTypeMetaValueConfiguration): MichelsonTypeMapping {
    const values: unknown[] = Array.isArray(configuration.values) ? configuration.values : [configuration.values]
    if (values[0] instanceof MichelsonTypeMapping) {
      return values[0]
    }

    const raw: unknown = this.getRawValue(values)

    const genericFactories: ((genericValue: unknown) => MichelsonTypeMapping)[] = 
      this.generics.map((genericMeta: MichelsonTypeMeta) => {
        return (genericValue: unknown): MichelsonTypeMapping => genericMeta.createValue({
          registry: configuration.registry,
          lazyEval: configuration.lazyEval,
          values: genericValue
        })
      })

    const value: MichelsonTypeMapping = michelsonTypeFactories[this.type](raw, ...genericFactories)
    if (!(configuration.lazyEval ?? true)) {
      value.eval()
    }

    if (configuration.registry) {
      this.saveValueInRegistry(value, configuration.registry)
    }

    return value
  }
}