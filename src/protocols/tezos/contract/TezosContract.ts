import axios from '../../../dependencies/src/axios-0.19.0/index'

export class TezosContract {

  public static defaultMethodName = 'default'

  private script: any | undefined
  private methodList: TezosContractMethod[] | undefined

  private pendingScriptPromise: Promise<any> | undefined

  private get parameter(): any {
    const code: any[] = this.script.code
    return code.find((val) => val.prim === 'parameter')
  }

  constructor(private address: string, private rpcURL: string) {}

  public async bigMapValue(key: string): Promise<string> {
    return ''
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
    this.pendingScriptPromise = axios.get(this.url(`/chains/main/blocks/head/context/contracts/${this.address}/script`)).then((result) => {
      this.pendingScriptPromise = undefined
      return result.data
    }).catch((error) => {
      this.pendingScriptPromise = undefined
      throw error
    })
    this.script = await this.pendingScriptPromise
    this.pendingScriptPromise = undefined
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

  private url(path: string): string {
    return `${this.rpcURL}${path}`
  }
}

export class TezosContractMethod {

  constructor(
    public selector: TezosContractMethodSelector,
    public name: string
  ) { }
}

export enum TezosContractMethodSelectorPathComponent {
  LEFT = 'left',
  RIGHT = 'right'
}

export class TezosContractMethodSelector {

  constructor(
    public path: TezosContractMethodSelectorPathComponent[]
  ) { }

  public add(component: TezosContractMethodSelectorPathComponent) {
    this.path.push(component)
  }

  public copy(): TezosContractMethodSelector {
    return new TezosContractMethodSelector(this.path.slice())
  }

  public static fromJSON(json: any): {selector: TezosContractMethodSelector, value: any} {
    const selector = new TezosContractMethodSelector([])
    let current = json
    while (current.prim !== undefined) {
      const prim: string = (current.prim as string).toLowerCase()
      if (prim === 'left') {
        selector.add(TezosContractMethodSelectorPathComponent.LEFT)
      } else if (prim === 'right') {
        selector.add(TezosContractMethodSelectorPathComponent.RIGHT)
      } else {
        break
      }
      if (Array.isArray(current.args) && current.args.length === 1) {
        current = current.args[0]
      } else {
        break
      }
    }
    return {selector: selector, value: current}
  }
}
