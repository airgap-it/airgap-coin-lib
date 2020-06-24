import { MichelineDataNode } from '../micheline/MichelineNode'

export abstract class MichelsonTypeMapping {
  public abstract toMichelineJSON(): MichelineDataNode

  public eval(): void {
    // default implementation, no action required
  }
}