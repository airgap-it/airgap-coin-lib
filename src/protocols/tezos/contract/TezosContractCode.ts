import { MichelsonTypeMapping } from './michelson/types'

export interface ITezosContractCode {
  parameter: MichelsonTypeMapping
  storage: MichelsonTypeMapping
}

export class TezosContractCode implements ITezosContractCode {
  readonly parameter: MichelsonTypeMapping
  readonly storage: MichelsonTypeMapping

  constructor(parameter?: MichelsonTypeMapping | MichelsonTypeMapping[], storage?: MichelsonTypeMapping | MichelsonTypeMapping[]) {
    if ((!parameter || Array.isArray(parameter) && parameter.length !== 1) || (!storage || Array.isArray(storage) && storage.length !== 1)) {
      throw new Error('Invalid contract structure')
    }

    this.parameter = Array.isArray(parameter) ? parameter[0] : parameter
    this.storage = Array.isArray(storage) ? storage[0]: storage
  }
}