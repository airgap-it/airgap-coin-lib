import { TezosContractEntity } from "./TezosContractEntity";

export class TezosContractUnit extends TezosContractEntity {
  toJSON() {
    return { prim: 'Unit' }
  }
}