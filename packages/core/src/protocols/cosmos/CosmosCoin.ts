import BigNumber from '../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { UnsupportedError } from '../../errors'
import { Domain } from '../../errors/coinlib-error'
import { JSONConvertible, RPCConvertible } from './CosmosTransaction'

export interface CosmosCoinJSON {
  denom: string
  amount: string
}

export class CosmosCoin implements JSONConvertible, RPCConvertible {
  private static readonly supportedDenominations = ['uatom']
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
    if (!CosmosCoin.supportedDenominations.includes(json.denom)) {
      throw new UnsupportedError(Domain.COSMOS, 'Unsupported cosmos denomination')
    }

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

  public static sum(coins: CosmosCoin[]): BigNumber {
    return coins.reduce((current, next) => current.plus(new BigNumber(next.amount)), new BigNumber(0))
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
