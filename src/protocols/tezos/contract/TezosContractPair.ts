import { TezosContractEntity } from './TezosContractEntity'
import { TezosUtils } from '../TezosUtils'

export class TezosContractPair extends TezosContractEntity {
  first: string | number | TezosContractEntity
  second: string | number | TezosContractEntity

  constructor(first: string | number | TezosContractEntity, second: string | number | TezosContractEntity) {
    super()
    this.first = first
    this.second = second
  }

  toJSON(): any {
    return {
      prim: 'Pair',
      args: [this.jsonEncodedArg(this.first), this.jsonEncodedArg(this.second)]
    }
  }

  static fromJSON(json: any): TezosContractPair {
    if (json.prim !== 'Pair') {
      throw new Error('type not supported')
    }
    return new TezosContractPair(this.argumentsFromJSON(json.args[0]), this.argumentsFromJSON(json.args[1]))
  }

  static argumentsFromJSON(json: any): string | number | TezosContractPair {
    if (json.string !== undefined) {
      return json.string
    }
    if (json.int !== undefined) {
      return parseInt(json.int)
    }
    if (json.bytes !== undefined) {
      return TezosUtils.parseAddress(json.bytes)
    }
    if (json.prim !== undefined) {
      return TezosContractPair.fromJSON(json)
    }
    throw new Error('type not supported')
  }

  private jsonEncodedArg(arg: string | number | TezosContractEntity): any {
    switch (typeof arg) {
      case 'string':
        return { string: arg }
      case 'number':
        return { int: arg.toString() }
      default:
        return (arg as TezosContractEntity).toJSON()
    }
  }
}
