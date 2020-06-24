import { MichelsonType } from '../types/michelson/MichelsonType'
import { TezosTransactionParameters } from '../types/operations/Transaction'

export class TezosContractCall {
  constructor(
    readonly entrypoint: string, 
    readonly value: MichelsonType | undefined,
    readonly parameterRegistry?: Map<string, MichelsonType>
  ) {}

  public argument<T extends MichelsonType>(name: string): T | undefined {
    return this.parameterRegistry?.get(name) as T
  }

  public toJSON(): TezosTransactionParameters {
    return {
      entrypoint: this.entrypoint,
      value: this.value ? this.value.toMichelineJSON() : []
    }
  }
}