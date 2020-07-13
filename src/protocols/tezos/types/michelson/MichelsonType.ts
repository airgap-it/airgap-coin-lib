import { MichelineDataNode } from '../micheline/MichelineNode'

export abstract class MichelsonType {
  constructor(public name?: string) {}

  public abstract asRawValue(): any
  public abstract toMichelineJSON(): MichelineDataNode

  public eval(): void {
    // default implementation, no action required
  }

  public setName(name: string) {
    this.name = name
  }
}