import { MichelinePrimitiveApplication, MichelineTypeNode } from '../micheline/MichelineNode'

export interface TezosContractCode extends MichelinePrimitiveApplication<any> {
  prim: 'parameter' | 'storage'
  args: MichelineTypeNode[]
}
