import { MichelineTypeNode } from '../types/micheline/MichelineNode'
import { MichelsonTypeMeta } from '../types/michelson/MichelsonTypeMeta'

export class TezosContractStorage {
  public static fromJSON(storage: MichelineTypeNode): TezosContractStorage | undefined {
    const type: MichelsonTypeMeta | undefined = MichelsonTypeMeta.fromMichelineNode(storage)

    return type ? new TezosContractStorage(type) : undefined
  }

  constructor(readonly type: MichelsonTypeMeta) {}
}
