import { TezosContractEntity } from "./TezosContractEntity"

export class TezosContractList extends TezosContractEntity {

    constructor(
      public items: (string | number | TezosContractEntity)[]
    ) {
      super()
    }
    
    toJSON() {
      return this.items.map((item) => {
        switch (typeof item) {
          case 'string':
            return { string: item }
          case 'number':
            return { int: item.toString() }
          default:
            return (item as TezosContractEntity).toJSON()
        } 
      })
    }
  }