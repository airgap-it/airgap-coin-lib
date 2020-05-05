import axios, { AxiosResponse } from '../../../dependencies/src/axios-0.19.0/index'
import { TezosContractMethodSelectorPathComponent, TezosContractMethod, TezosContractMethodSelector } from './TezosContractMethod'

export class TezosContract {

  public static defaultMethodName = 'default'

  private script: any | undefined
  private methodList: TezosContractMethod[] | undefined
  private bigMapID: number | undefined

  private pendingScriptPromise: Promise<any> | undefined
  private pendingBigMapIDPromise: Promise<number> | undefined

  private get parameter(): any {
    const code: any[] = this.script.code
    return code.find((val) => val.prim === 'parameter')
  }

  constructor(
    private address: string, 
    private nodeRPCURL: string, 
    private conseilAPIURL: string, 
    private conseilNetwork: string,
    private conseilAPIKey: string
  ) {}

  public async bigMapValue(key: string, isKeyHash: boolean = false): Promise<string|null> {
    await this.fetchBigMapIDIfNeeded()
    const predicates: {field: string, operation: string, set: any[]}[] = [
      {
        field: "big_map_id",
        operation: "eq",
        set: [this.bigMapID]
      }
    ]
    if (isKeyHash) {
      predicates.push({
        field: "key_hash",
        operation: "eq",
        set: [key]
      })
    } else {
      predicates.push({
        field: "key",
        operation: "eq",
        set: [key]
      })
    }
    return await this.conseilRequest<{value: string|null}[]>('/big_map_contents', {
      fields: ["value"],
      predicates: predicates,
      limit: 1
    }).then((response) => {
      const results = response.data
      if (results.length === 0) {
        return null
      }
      return results[0].value
    })
  }

  public async bigMapValues(predicates: BigMapValuePredicate[]): Promise<{key: string, value: string|null}[]> {
    await this.fetchBigMapIDIfNeeded()
    return (await this.conseilRequest<{key: string, value: string|null}[]>('/big_map_contents', {
      fields: ["key", "value"],
      predicates: [
        {
          field: "big_map_id",
          operation: "eq",
          set: [this.bigMapID],
          inverse: false
        },
        ...predicates
      ]
    })).data
  }

  public async methods(): Promise<TezosContractMethod[]> {
    if (this.methodList !== undefined) {
      return this.methodList
    }
    await this.fetchScriptIfNeeded()
    this.methodList = this.extractMethods(this.parameter)
    return this.methodList
  }

  public async methodForSelector(selector: TezosContractMethodSelector): Promise<TezosContractMethod> {
    if (selector.path.length === 0) {
      return new TezosContractMethod(selector, TezosContract.defaultMethodName)
    }
    await this.fetchScriptIfNeeded()
    
    let current = this.parameter.args[0]
    for (const pathComponent of selector.path) {
      const prim = (current.prim as string).toLowerCase()
      if (prim !== 'or' || !Array.isArray(current.args) || current.args.length !== 2) {
        throw new Error('Cannot find method')
      }
      switch (pathComponent) {
        case TezosContractMethodSelectorPathComponent.LEFT:
          current = current.args[0]
          break
        case TezosContractMethodSelectorPathComponent.RIGHT:
          current = current.args[1]
          break
      }
    }

    const annots = current.annots
    if (!Array.isArray(annots) || annots.length === 0) {
      throw new Error('Cannot find method')  
    }
    const methodName: string = annots.find((annot: string) => annot.startsWith('%'))
    return new TezosContractMethod(selector, methodName.substring(1))
  }

  private async fetchScriptIfNeeded(): Promise<void> {
    if (this.script !== undefined) {
      return
    }
    if (this.pendingScriptPromise !== undefined) {
      await this.pendingScriptPromise
      return
    }
    this.pendingScriptPromise = axios.get(this.nodeURL(`/chains/main/blocks/head/context/contracts/${this.address}/script`)).then((result) => {
      this.pendingScriptPromise = undefined
      return result.data
    }).catch((error) => {
      this.pendingScriptPromise = undefined
      throw error
    })
    this.script = await this.pendingScriptPromise
  }

  private async fetchBigMapIDIfNeeded(): Promise<void> {
    if (this.bigMapID !== undefined) {
      return
    }
    if (this.pendingBigMapIDPromise !== undefined) {
      await this.pendingBigMapIDPromise
      return
    }
    this.pendingBigMapIDPromise = this.conseilRequest<{big_map_id: number}[]>('/originated_account_maps', {
      fields: ["big_map_id"],
      predicates: [
        {
          field: "account_id",
          operation: "eq",
          set: [this.address]
        }
      ],
      limit: 1
    }).then((response) => { 
      this.pendingBigMapIDPromise = undefined
      const results = response.data
      if (results.length === 0) {
        throw new Error('BigMap ID not found')
      }
      return results[0].big_map_id
    }).catch((error) => {
      this.pendingBigMapIDPromise = undefined
      throw error
    })
    this.bigMapID = await this.pendingBigMapIDPromise
  }

  private extractMethods(parameters: any): TezosContractMethod[] {
    const root = parameters.args[0]
    return this.searchMethods(root)
  }

  private searchMethods(val: any, path?: TezosContractMethodSelectorPathComponent, currentSelector?: TezosContractMethodSelector): TezosContractMethod[] {
    const selector: TezosContractMethodSelector = currentSelector !== undefined ? currentSelector.copy() : new TezosContractMethodSelector([])
    if (path !== undefined) {
      selector.add(path)
    }

    const prim = (val.prim as string).toLowerCase()

    if (prim === 'or') {
      const left = this.searchMethods(val.args[0], TezosContractMethodSelectorPathComponent.LEFT, selector)
      const right = this.searchMethods(val.args[1], TezosContractMethodSelectorPathComponent.RIGHT, selector)
      return left.concat(right)
    }

    const annots = val.annots
    if (Array.isArray(annots) && annots.length > 0) {
      const methodName: string = annots.find((annot: string) => annot.startsWith('%'))
      return [
        new TezosContractMethod(selector, methodName.substring(1))
      ]
    }

    throw new Error('Cannot parse parameters')
  }

  private nodeURL(path: string): string {
    return `${this.nodeRPCURL}${path}`
  }

  private conseilURL(path: string): string {
    return `${this.conseilAPIURL}/v2/data/tezos/${this.conseilNetwork}${path}`
  }

  private conseilRequest<Result>(path: string, body: any): Promise<AxiosResponse<Result>> {
    return axios.post(this.conseilURL(path), body, {
      headers: { 'Content-Type': 'application/json', apiKey: this.conseilAPIKey }
    })
  }
}

export interface BigMapValuePredicate {
  field: 'key' | 'key_hash' | 'value' 
  operation: 'in' | 'between' | 'like' | 'lt' | 'gt' | 'eq' | 'startsWith' | 'endsWith' | 'before' | 'after'
  set: any[] 
  inverse?: boolean 
}
