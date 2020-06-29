import { MichelsonType } from '../types/michelson/MichelsonType'
import { TezosTransactionParameters } from '../types/operations/Transaction'

import { TezosContractEntrypoint } from './TezosContractEntrypoint'

export class TezosContractCall {
  constructor(
    readonly entrypoint: string | TezosContractEntrypoint, 
    readonly michelsonValue: MichelsonType | undefined
  ) {}

  public args(): any | undefined {
    return this.michelsonValue?.asRawValue()
  }

  public toJSON(): TezosTransactionParameters {
    return {
      entrypoint: typeof this.entrypoint === 'string' ? this.entrypoint : this.entrypoint.name,
      value: this.michelsonValue ? this.michelsonValue.toMichelineJSON() : []
    }
  }
}