import { TezosContractEntity } from './TezosContractEntity'

export class TezosContractInt extends TezosContractEntity {
  value: number

  constructor(value: number) {
    super()
    this.value = value
  }

  toJSON() {
    return { int: this.value }
  }
}
