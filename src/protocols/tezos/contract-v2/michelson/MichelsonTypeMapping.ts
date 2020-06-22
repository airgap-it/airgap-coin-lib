import { MichelineNode } from '../micheline/MichelineNode'

export abstract class MichelsonTypeMapping {
  public abstract toMichelineJSON(): MichelineNode
}