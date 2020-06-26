import { MichelsonType } from '../types/michelson/MichelsonType'
import { MichelsonGenericTypeMeta } from '../types/michelson/MichelsonTypeMeta'
import { TezosTransactionParameters } from '../types/operations/Transaction'

import { TezosContractEntrypoint } from './TezosContractEntrypoint'

export class TezosContractCall {
  private namedValues?: Record<string, any>[]

  constructor(
    readonly entrypoint: string | TezosContractEntrypoint, 
    readonly michelsonValue: MichelsonType | undefined,
    private readonly namedValuesRegistry?: Map<MichelsonGenericTypeMeta, [MichelsonType | MichelsonGenericTypeMeta, string | undefined][]>
  ) {}

  public args(): Record<string, unknown>[] {
    if (!this.namedValues) {
      this.initNamedValues()
    }

    return this.namedValues ?? []
  }

  public toJSON(): TezosTransactionParameters {
    return {
      entrypoint: typeof this.entrypoint === 'string' ? this.entrypoint : this.entrypoint.name,
      value: this.michelsonValue ? this.michelsonValue.toMichelineJSON() : []
    }
  }

  private initNamedValues(): void {
    if (!(this.entrypoint instanceof TezosContractEntrypoint) || !(this.entrypoint.type instanceof MichelsonGenericTypeMeta)) {
      this.namedValues = []

      return
    }

    const namedValues = this.createNamedValues(this.entrypoint.type) ?? []
    this.namedValues = Array.isArray(namedValues) ? namedValues : [namedValues]
    
    this.namedValuesRegistry?.clear()
  }

  private createNamedValues(root: MichelsonGenericTypeMeta | undefined): any | undefined {
    if (root === undefined || !this.namedValuesRegistry) {
      return undefined
    }

    const innerValues: [MichelsonType | MichelsonGenericTypeMeta, string | undefined][] = this.namedValuesRegistry.get(root) ?? []
    const isList: boolean = innerValues.every(([_, name]: [MichelsonType | MichelsonGenericTypeMeta, string | undefined]) => name === undefined)

    const mappedInnerValues: [any, string | undefined][] = innerValues
      .map(([value, name]: [MichelsonType | MichelsonGenericTypeMeta, string | undefined]) => {
        return [value instanceof MichelsonType ? value : this.createNamedValues(value), name] as [any | undefined, string | undefined]
      })
      .filter(([value, _]: [any | undefined, string | undefined]) => {
        return value !== undefined
      })

    return isList 
      ? this.createListWithNamedValues(mappedInnerValues) 
      : this.createObjectWithNamedValues(mappedInnerValues)
  }

  private createListWithNamedValues(innerValues: [any, string | undefined][]): any[] {
    return innerValues.map(([value, _]: [any, string | undefined]) => value)
  }

  private createObjectWithNamedValues(innerValues: [any, string | undefined][]): Record<string, any> {
    let object = {}

    innerValues.forEach(([value, name]: [any, string | undefined]) => {
      if (name) {
        object[name] = value
      } else {
        object = Object.assign(object, value)
      }
    })

    return object
  }

}