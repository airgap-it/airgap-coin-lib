import { RPCConvertible, JSONConvertible } from './CosmosTransaction'

export interface CosmosCoinJSON {
  denom: string
  amount: string
}

export class CosmosCoin implements JSONConvertible, RPCConvertible {
  public readonly denom: string
  public readonly amount: string

  constructor(denom: string, amount: string) {
    this.denom = denom
    this.amount = amount
  }

  public toJSON(): CosmosCoinJSON {
    return {
      amount: this.amount,
      denom: this.denom
    }
  }

  public static fromJSON(json: CosmosCoinJSON): CosmosCoin {
    return new CosmosCoin(json.denom, json.amount)
  }

  public toRPCBody(): any {
    return {
      amount: this.amount,
      denom: this.denom
    }
  }

  public static fromRPCBody(json: any): CosmosCoin {
    return new CosmosCoin(json.denom, json.amount)
  }
}
