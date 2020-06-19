// tslint:disable: max-classes-per-file

import { MichelsonType } from './MichelsonType'
import { MichelineNode } from '../micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from '../micheline/utils'

export class MichelsonTypeMeta {
  constructor(readonly type: MichelsonType, readonly annots: string[] = []) {}
}

export class MichelsonGenericTypeMeta extends MichelsonTypeMeta {
  constructor(type: MichelsonType, readonly generics: MichelsonTypeMeta[], annots: string[] = []) {
    super(type, annots)
  }
}

export class MichelsonTypeMetaFactory {
  public static fromMichelineNode(node: MichelineNode): MichelsonTypeMeta | undefined {
    if (!isMichelinePrimitiveApplication(node)) {
      return undefined
    }

    const argsMeta: MichelsonTypeMeta[] = node.args 
      ? node.args
          .map((arg: MichelineNode) => MichelsonTypeMetaFactory.fromMichelineNode(arg))
          .filter((meta: MichelsonTypeMeta | undefined) => meta !== undefined) as MichelsonTypeMeta[]
      : []

    return MichelsonTypeMetaFactory.from(node.prim, node.annots || [], argsMeta)
  }

  public static from(type: MichelsonType, annots: string[], argsMeta: MichelsonTypeMeta[]): MichelsonTypeMeta {
    return argsMeta.length === 0 ? new MichelsonTypeMeta(type, annots) : new MichelsonGenericTypeMeta(type, argsMeta, annots)
  }
}