import { MichelsonTypeMeta, MichelsonTypeMetaFactory } from './michelson/MichelsonTypeMeta'
import { MichelineNode } from './micheline/MichelineNode'
import { isMichelinePrimitiveApplication } from './micheline/utils'

export class TezosContractEntrypoint {

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
  ) {}
}