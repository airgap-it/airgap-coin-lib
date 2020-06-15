import { TezosContractEntity } from './TezosContractEntity'

export class TezosContractUnit extends TezosContractEntity {
  public toJSON() {
    return { prim: 'Unit' }
  }
}
