import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { JSONConvertible } from '@airgap/coinlib-core/interfaces/JSONConvertible'
import { RPCConvertible } from '@airgap/coinlib-core/interfaces/RPCConvertible'

export interface CosmosCoinJSON {
  denom: string
  amount: string
}

const COSMOS_DENOM = 'uatom'

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

  public static fromCoins(json: CosmosCoinJSON[]): CosmosCoin[] {
    return json
      .map((coinJSON) => {
        try {
          return CosmosCoin.fromJSON(coinJSON)
        } catch {
          return undefined
        }
      })
      .filter((value) => value !== undefined) as CosmosCoin[]
  }

  public static sum(coins: CosmosCoin[], denom: string = COSMOS_DENOM): BigNumber {
    return coins.reduce((current, next) => {
      if (next.denom === denom) {
        return current.plus(new BigNumber(next.amount))
      }
      return current
    }, new BigNumber(0))
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
