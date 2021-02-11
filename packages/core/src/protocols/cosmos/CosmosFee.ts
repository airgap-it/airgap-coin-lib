import { CosmosCoin } from './CosmosCoin'
import { JSONConvertible, RPCConvertible } from './CosmosTransaction'

export class CosmosFee implements JSONConvertible, RPCConvertible {
  public readonly amount: CosmosCoin[]
  public readonly gas: string

  constructor(amount: CosmosCoin[], gas: string) {
    this.amount = amount
    this.gas = gas
  }

  public toJSON() {
    return {
      amount: this.amount.map((value) => value.toJSON()),
      gas: this.gas
    }
  }

  public static fromJSON(json: any): CosmosFee {
    return new CosmosFee(
      json.amount.map((value: any) => CosmosCoin.fromJSON(value)),
      json.gas
    )
  }

  public toRPCBody(): any {
    return {
      amount: this.amount.map((value) => value.toRPCBody()),
      gas: this.gas
    }
  }

  public static fromRPCBody(json: any): CosmosFee {
    return new CosmosFee(
      json.amount.map((value: any) => CosmosCoin.fromRPCBody(value)),
      json.gas
    )
  }
}
