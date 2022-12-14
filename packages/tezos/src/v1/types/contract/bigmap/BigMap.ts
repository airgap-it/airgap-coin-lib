import { MichelineTypeNode } from '../../micheline/MichelineNode'

export interface BigMap {
  id: number
  path: string
  keyType: MichelineTypeNode
  valueType: MichelineTypeNode
}
