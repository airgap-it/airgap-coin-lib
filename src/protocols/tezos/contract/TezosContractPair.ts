import { TezosContractEntity } from './TezosContractEntity'
import { TezosContractString } from './TezosContractString'
import { TezosContractInt } from './TezosContractInt'
import { TezosContractBytes } from './TezosContractBytes'

export class TezosContractPair extends TezosContractEntity {
  first: TezosContractEntity
  second: TezosContractEntity

  constructor(first: TezosContractEntity, second: TezosContractEntity) {
    super()
    this.first = first
    this.second = second
  }

  toJSON(): any {
    return {
      prim: 'Pair',
      args: [this.first.toJSON(), this.second.toJSON()]
    }
  }

  static fromJSON(json: any): TezosContractPair {
    if (json.prim !== 'Pair') {
      throw new Error('type not supported')
    }
    return new TezosContractPair(this.argumentsFromJSON(json.args[0]), this.argumentsFromJSON(json.args[1]))
  }

  static argumentsFromJSON(json: any): TezosContractEntity {
    if (json.string !== undefined) {
      return new TezosContractString(json.string)
    }
    if (json.int !== undefined) {
      return new TezosContractInt(json.int)
    }
    if (json.bytes !== undefined) {
      return new TezosContractBytes(json.bytes)
    }
    if (json.prim === 'Pair') {
      return TezosContractPair.fromJSON(json)
    }
    throw new Error('type not supported')
  }
}
