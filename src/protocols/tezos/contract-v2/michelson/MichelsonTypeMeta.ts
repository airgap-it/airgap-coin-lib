// tslint:disable: max-classes-per-file

import { MichelsonType, michelsonTypeFactories } from './MichelsonType'
import { MichelsonTypeMapping } from './MichelsonTypeMapping'
import { MichelineTypeNode } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

const ANNOTATION_PREFIX_ARG = ':'

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

  public createValue(...values: unknown[]): MichelsonTypeMapping {
    if (values[0] instanceof MichelsonTypeMapping) {
      return values[0]
    }

    const argName: string | undefined = this.getAnnotation(ANNOTATION_PREFIX_ARG)
    const value: unknown = values[0] instanceof Object && argName && argName in values[0]
      ? values[0][argName]
      : values[0]
      
    return michelsonTypeFactories[this.type](value)
  }

  protected getAnnotation(prefix: string): string | undefined {
    const annotation: string | undefined = this.annots.find((annot: string) => annot.startsWith(prefix))

    return annotation?.slice(prefix.length)
  }
}

export class MichelsonGenericTypeMeta extends MichelsonTypeMeta {
  constructor(type: MichelsonType, readonly generics: MichelsonTypeMeta[], annots: string[] = []) {
    super(type, annots)
  }

  public createValue(...values: unknown[]): MichelsonTypeMapping {
    if (values[0] instanceof MichelsonTypeMapping) {
      return values[0]
    }

    const argName: string | undefined = this.getAnnotation(ANNOTATION_PREFIX_ARG)
    const value: unknown = values[0] instanceof Object && argName && argName in values[0]
      ? values[0][argName]
      : values[0]

    const genericFactories = this.generics.map((genericMeta: MichelsonTypeMeta) => {
      return (value: unknown) => genericMeta.createValue(value)
    })

    return michelsonTypeFactories[this.type](value, ...genericFactories)
  }
}