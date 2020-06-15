import { TezosContractEntity } from './TezosContractEntity'

export enum TezosContractEntrypointName {
  BALANCE = 'getBalance',
  ALLOWANCE = 'getAllowance',
  APPROVE = 'approve',
  TRANSFER = 'transfer',
  TOTAL_SUPPLY = 'getTotalSupply',
  TOTAL_MINTED = 'getTotalMinted',
  TOTAL_BURNED = 'getTotalBurned'
}

export class TezosContractEntrypoint extends TezosContractEntity {
  static transfer = new TezosContractEntrypoint(TezosContractEntrypointName.TRANSFER)
  static balance = new TezosContractEntrypoint(TezosContractEntrypointName.BALANCE)
  static allowance = new TezosContractEntrypoint(TezosContractEntrypointName.ALLOWANCE)
  static approve = new TezosContractEntrypoint(TezosContractEntrypointName.APPROVE)
  static totalsupply = new TezosContractEntrypoint(TezosContractEntrypointName.TOTAL_SUPPLY)
  static totalminted = new TezosContractEntrypoint(TezosContractEntrypointName.TOTAL_MINTED)
  static totalburned = new TezosContractEntrypoint(TezosContractEntrypointName.TOTAL_BURNED)

  readonly name: TezosContractEntrypointName

  constructor(name: TezosContractEntrypointName) {
    super()
    this.name = name
  }

  toJSON(): any {
    return `${this.name}`
  }

  static fromJSON(json: any): TezosContractEntrypoint {
    if (typeof json !== 'string') {
      throw new Error('expected a string as input')
    }
    const name: string = json
    switch (name) {
      case TezosContractEntrypointName.TRANSFER:
        return new TezosContractEntrypoint(TezosContractEntrypointName.TRANSFER)
      case TezosContractEntrypointName.BALANCE:
        return new TezosContractEntrypoint(TezosContractEntrypointName.BALANCE)
      case TezosContractEntrypointName.ALLOWANCE:
        return new TezosContractEntrypoint(TezosContractEntrypointName.ALLOWANCE)
      case TezosContractEntrypointName.APPROVE:
        return new TezosContractEntrypoint(TezosContractEntrypointName.APPROVE)
      default:
        throw new Error('unsupported entrypoint')
    }
  }

  static fromString(name: string): TezosContractEntrypoint {
    switch (name) {
      case TezosContractEntrypointName.BALANCE:
        return TezosContractEntrypoint.balance
      case TezosContractEntrypointName.APPROVE:
        return TezosContractEntrypoint.approve
      case TezosContractEntrypointName.ALLOWANCE:
        return TezosContractEntrypoint.allowance
      case TezosContractEntrypointName.TRANSFER:
        return TezosContractEntrypoint.transfer
      default:
        throw new Error('Cannot get entrypoint name from string')
    }
  }
}
