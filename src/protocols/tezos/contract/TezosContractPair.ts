import { TezosContractBytes } from './TezosContractBytes'
import { TezosContractEntity } from './TezosContractEntity'
import { TezosContractInt } from './TezosContractInt'
import { TezosContractString } from './TezosContractString'

export class TezosContractPair extends TezosContractEntity {
  public first: TezosContractEntity
  public second: TezosContractEntity

  constructor(first: TezosContractEntity, second: TezosContractEntity) {
    super()
    this.first = first
    this.second = second
  }

  public toJSON(): any {
    return {
      prim: 'Pair',
      args: [this.first.toJSON(), this.second.toJSON()]
    }
  }

  public static fromJSON(json: any): TezosContractPair {
    if (json.prim !== 'Pair') {
      throw new Error('type not supported')
    }

    return new TezosContractPair(this.argumentsFromJSON(json.args[0]), this.argumentsFromJSON(json.args[1]))
  }

  public static argumentsFromJSON(json: any): TezosContractEntity {
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
