import { MichelsonTypeMeta } from './michelson/MichelsonTypeMeta'
import { MichelineTypeNode } from './micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from './micheline/utils'

export class TezosContractEntrypoint {

  public static fromJSON(entrypoints: Record<string, MichelineTypeNode>): TezosContractEntrypoint[] {
    return Object.entries(entrypoints)
      .filter(([_, node]: [string, MichelineTypeNode]) => isMichelinePrimitiveApplication(node))
      .map(([name, node]: [string, MichelineTypeNode]) => {
        const type: MichelsonTypeMeta | undefined = MichelsonTypeMeta.fromMichelineNode(node)

        return type ? new TezosContractEntrypoint(name, type) : undefined
      })
      .filter((entrypoint: TezosContractEntrypoint | undefined) => entrypoint !== undefined) as TezosContractEntrypoint[]
  }

  constructor(
    readonly name: string,
    readonly type: MichelsonTypeMeta,
  ) {}
}