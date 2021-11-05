import { UnsupportedError } from '../../../../errors'
import { Domain } from '../../../../errors/coinlib-error'
import { MichelineDataNode } from '../micheline/MichelineNode'

export abstract class MichelsonType {
  constructor(public name?: string) {}

  public abstract asRawValue(): any
  public abstract toMichelineJSON(): MichelineDataNode

  public eval(): void {
    // default implementation, no action required
  }

  public encode(): string {
    throw new UnsupportedError(Domain.TEZOS, 'Encoding for this Michelson type is not supported')
  }

  public setName(name: string) {
    this.name = name
  }
}
