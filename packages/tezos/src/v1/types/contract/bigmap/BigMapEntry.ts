import { MichelineDataNode } from '../../micheline/MichelineNode'

export interface BigMapEntry {
  bigMapId: number
  key: MichelineDataNode
  keyHash: string
  value: MichelineDataNode
}
