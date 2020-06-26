import { MichelineDataNode } from '../micheline/MichelineNode'

export abstract class MichelsonType {
  public abstract toMichelineJSON(): MichelineDataNode
  public eval(): void {
    // default implementation, no action required
  }
}