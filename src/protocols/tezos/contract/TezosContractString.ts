import { TezosContractEntity } from "./TezosContractEntity";

export class TezosContractString extends TezosContractEntity {

  value: string

  constructor(value: string) {
    super()
    this.value = value
  }

  toJSON() {
    return { string: this.value }
  }
}