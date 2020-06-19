import { MichelsonTypeMeta, MichelsonGenericTypeMeta, MichelsonTypeMetaFactory } from './michelson/MichelsonTypeMeta'
import { MichelineNode } from './micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from './micheline/utils'

const ANNOTATION_PREFIX_ARG = ':'

export class TezosContractEntrypoint {
  public readonly namedArgs?: Map<string, MichelsonTypeMeta>

  public static fromJSON(entrypoints: Record<string, MichelineNode>): TezosContractEntrypoint[] {
    return Object.entries(entrypoints)
      .filter(([_, node]: [string, MichelineNode]) => isMichelinePrimitiveApplication(node))
      .map(([name, node]: [string, MichelineNode]) => {
        const type: MichelsonTypeMeta | undefined = MichelsonTypeMetaFactory.fromMichelineNode(node)

        return type ? new TezosContractEntrypoint(name, type) : undefined
      })
      .filter((entrypoint: TezosContractEntrypoint | undefined) => entrypoint !== undefined) as TezosContractEntrypoint[]
  }

  constructor(
    readonly name: string,
    readonly type: MichelsonTypeMeta,
  ) {
    if (this.hasNamedArgs(type)) {
      this.namedArgs = new Map(this.getNamedPairs(this.type))
    }
  }

  private hasNamedArgs(type: MichelsonTypeMeta): boolean {
    if (type instanceof MichelsonGenericTypeMeta) {
      return type.generics.reduce((areNamed: boolean, next: MichelsonTypeMeta) => areNamed && this.hasNamedArgs(next), true)
    }

    return type.annots.find((annot: string) => annot.startsWith(ANNOTATION_PREFIX_ARG)) !== undefined
  }

  private getNamedPairs(args: MichelsonTypeMeta | MichelsonTypeMeta[]): [string, MichelsonTypeMeta][] {
    if (Array.isArray(args)) {
      return args.reduce((reduced: [string, MichelsonTypeMeta][], next: MichelsonTypeMeta) => reduced.concat(this.getNamedPairs(next)), [])
    }
    const nameAnnot: string | undefined = args.annots.find((annot: string) => annot.startsWith(ANNOTATION_PREFIX_ARG))

    let namedPairs: [string | undefined, MichelsonTypeMeta][] = [
      [nameAnnot ? nameAnnot.slice(1) : undefined, args]
    ]

    if (args instanceof MichelsonGenericTypeMeta) {
      namedPairs = [
        ...namedPairs, 
        ...this.getNamedPairs(args.generics)
      ]
    }

    return namedPairs.filter(([name, _]: [string | undefined, MichelsonTypeMeta]) => name !== undefined) as [string, MichelsonTypeMeta][]
  }
}