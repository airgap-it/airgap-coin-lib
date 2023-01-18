import { MichelineDataNode } from '../micheline/MichelineNode'

export type BigMapEntryType = 'micheline' | 'json'

export interface BigMapEntry<T extends BigMapEntryType> {
  bigMapId: number
  key: MichelineDataNode
  keyHash: string
  value: T extends 'micheline' ? MichelineDataNode : Record<string, any>
}
