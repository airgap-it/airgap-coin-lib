import { JSONConvertible, RPCConvertible } from './CosmosTransaction'

export interface CosmosCoinJSON {
  denom: string
  amount: string
}

export class CosmosCoin implements JSONConvertible, RPCConvertible {
  private static supportedDonominations = ['uatom']
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
    if (!CosmosCoin.supportedDonominations.includes(json.denom)) {
      throw new Error('Unsupported cosmos denomination')
    }
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
