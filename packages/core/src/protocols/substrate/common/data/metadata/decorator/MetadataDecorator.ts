import { SubstrateCall } from './call/SubstrateCall'
import { SubstrateConstant } from './constant/SubstrateConstant'
import { SubstrateStorageEntry } from './storage/SubstrateStorageEntry'

export class MetadataDecorator {
  private readonly storageEntries: Map<string, SubstrateStorageEntry>
  private readonly calls: Map<string, SubstrateCall>
  private readonly constants: Map<string, SubstrateConstant>

  constructor(storageEntries: SubstrateStorageEntry[], calls: SubstrateCall[], constants: SubstrateConstant[]) {
    this.storageEntries = new Map(
      storageEntries.map((entry: SubstrateStorageEntry) => [this.createMapKey(entry.palletName, entry.prefix), entry])
    )
    this.calls = new Map(calls.map((call: SubstrateCall) => [this.createMapKey(call.palletName, call.name), call]))
    this.constants = new Map(
      constants.map((constant: SubstrateConstant) => [this.createMapKey(constant.palletName, constant.name), constant])
    )
  }

  public storageEntry(moduleName: string, entryName: string): SubstrateStorageEntry | undefined {
    const key: string = this.createMapKey(moduleName, entryName)

    return this.storageEntries.get(key)
  }

  public call(moduleName: string, callName: string): SubstrateCall | undefined {
    const key: string = this.createMapKey(moduleName, callName)

    return this.calls.get(key)
  }

  public constant(moduleName: string, constantName: string): SubstrateConstant | undefined {
    const key: string = this.createMapKey(moduleName, constantName)

    return this.constants.get(key)
  }

  private createMapKey(module: string, item: string): string {
    return `${module}_${item}`
  }
}
