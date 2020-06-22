import { MichelineDataNode } from '../micheline/MichelineNode'

export abstract class MichelsonTypeMapping {
  public abstract toMichelineJSON(): MichelineDataNode
}