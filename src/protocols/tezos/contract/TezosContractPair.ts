import { TezosUtils } from '../TezosUtils'

import { TezosContractEntity } from './TezosContractEntity'

export class TezosContractPair extends TezosContractEntity {
  public first: string | number | TezosContractEntity
  public second: string | number | TezosContractEntity

  constructor(first: string | number | TezosContractEntity, second: string | number | TezosContractEntity) {
    super()
    this.first = first
    this.second = second
  }

  public toJSON(): any {
    return {
      prim: 'Pair',
      args: [this.jsonEncodedArg(this.first), this.jsonEncodedArg(this.second)]
    }
  }

  public static fromJSON(json: any): TezosContractPair {
    if (json.prim !== 'Pair') {
      throw new Error('type not supported')
    }

    return new TezosContractPair(this.argumentsFromJSON(json.args[0]), this.argumentsFromJSON(json.args[1]))
  }

  public static argumentsFromJSON(json: any): string | number | TezosContractPair {
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
        return arg.toJSON()
    }
  }
}
