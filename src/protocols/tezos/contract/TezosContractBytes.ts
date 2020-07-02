import { TezosContractEntity } from './TezosContractEntity'

export class TezosContractBytes extends TezosContractEntity {
  value: string

  constructor(value: string) {
    super()
    this.value = value
  }

  toJSON() {
    return { bytes: this.value }
  }
}
