import { MichelineTypeNode } from '../types/micheline/MichelineNode'
import { MichelsonTypeMeta } from '../types/michelson/MichelsonTypeMeta'
import { isAnyMichelinePrimitiveApplication } from '../types/utils'

export class TezosContractEntrypoint {
  public static fromJSON(entrypoints: Record<string, MichelineTypeNode>): TezosContractEntrypoint[] {
    return Object.entries(entrypoints)
      .filter(([_, node]: [string, MichelineTypeNode]) => isAnyMichelinePrimitiveApplication(node))
      .map(([name, node]: [string, MichelineTypeNode]) => {
        const type: MichelsonTypeMeta | undefined = MichelsonTypeMeta.fromMichelineNode(node)

        return type ? new TezosContractEntrypoint(name, type) : undefined
      })
      .filter((entrypoint: TezosContractEntrypoint | undefined) => entrypoint !== undefined) as TezosContractEntrypoint[]
  }

  constructor(readonly name: string, readonly type: MichelsonTypeMeta) {}
}
