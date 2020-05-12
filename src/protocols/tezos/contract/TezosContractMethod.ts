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