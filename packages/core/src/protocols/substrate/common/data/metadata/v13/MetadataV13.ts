import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SCALEDecoder } from '../../scale/SCALEDecoder'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { SubstrateCall } from '../decorator/call/SubstrateCall'
import { SubstrateConstant } from '../decorator/constant/SubstrateConstant'
import { MetadataDecorator } from '../decorator/MetadataDecorator'
import { SubstrateStorageEntry } from '../decorator/storage/SubstrateStorageEntry'
import { MetadataVersioned } from '../MetadataVersioned'
import { MetadataV11Call } from '../v11/module/MetadataV11Call'
import { MetadataV11Constant } from '../v11/module/MetadataV11Constant'
import { MetadataV13Module } from './module/MetadataV13Module'
import { MetadataV13Storage } from './module/storage/MetadataV13Storage'
import { MetadataV13StorageEntry } from './module/storage/MetadataV13StorageEntry'

export class MetadataV13 extends MetadataVersioned {
  public static decode<Network extends SubstrateNetwork>(network: Network, runtimeVersion: number | undefined, raw: string): MetadataV13 {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const magicNumber = decoder.decodeNextInt(32) // 32 bits
    const version = decoder.decodeNextInt(8) // 8 bits
    const modules = decoder.decodeNextArray(MetadataV13Module.decode)

    return new MetadataV13(magicNumber.decoded, version.decoded, modules.decoded)
  }

  protected scaleFields = [this.magicNumber, this.version]

  protected constructor(readonly magicNumber: SCALEInt, readonly version: SCALEInt, readonly modules: SCALEArray<MetadataV13Module>) {
    super()
  }

  public decorate(supportedStorageEntries: Object, supportedCalls: Object, supportedConstants: Object): MetadataDecorator {
    const storageEntries: SubstrateStorageEntry[][] = []
    const calls: SubstrateCall[][] = []
    const constants: SubstrateConstant[][] = []

    for (const module of this.modules.elements) {
      const moduleName: string = module.name.value

      const storagePrefix: string | undefined = module.storage.value?.prefix?.value
      if (storagePrefix && Object.keys(supportedStorageEntries).includes(storagePrefix)) {
        const decoratedEntries: SubstrateStorageEntry[] | undefined = this.createDecoratedStorageEntries(
          module.storage.value,
          supportedStorageEntries
        )
        if (decoratedEntries) {
          storageEntries.push(decoratedEntries)
        }
      }

      if (Object.keys(supportedCalls).includes(moduleName)) {
        const decoratedCalls: SubstrateCall[] = this.createDecoratedCalls(
          moduleName,
          module.index.toNumber(),
          module.calls.value?.elements || []
        )
        calls.push(decoratedCalls)
      }

      if (Object.keys(supportedConstants).includes(moduleName)) {
        const decoratedConstants: SubstrateConstant[] = this.createDecoratedConstants(moduleName, module.constants.elements)
        constants.push(decoratedConstants)
      }
    }

    return new MetadataDecorator(
      storageEntries.reduce((flatten: SubstrateStorageEntry[], next: SubstrateStorageEntry[]) => flatten.concat(next), []),
      calls.reduce((flatten: SubstrateCall[], next: SubstrateCall[]) => flatten.concat(next), []),
      constants.reduce((flatten: SubstrateConstant[], next: SubstrateConstant[]) => flatten.concat(next), [])
    )
  }

  private createDecoratedStorageEntries(
    storage: MetadataV13Storage | undefined,
    supportedStorageEntries: Object
  ): SubstrateStorageEntry[] | undefined {
    if (storage) {
      return storage.storageEntries.elements
        .filter((entry: MetadataV13StorageEntry) => supportedStorageEntries[storage.prefix.value].includes(entry.name.value))
        .map((entry: MetadataV13StorageEntry) => entry.type.decorate(storage.prefix.value, entry.name.value))
    }

    return undefined
  }

  private createDecoratedCalls(moduleName: string, moduleIndex: number, calls: MetadataV11Call[]): SubstrateCall[] {
    return calls.map((call: MetadataV11Call, index: number) => {
      return {
        palletName: moduleName,
        name: call.name.value,
        palletIndex: moduleIndex,
        callIndex: index
      }
    })
  }

  private createDecoratedConstants(moduleName: string, constants: MetadataV11Constant[]): SubstrateConstant[] {
    return constants.map((constant: MetadataV11Constant) => {
      return {
        palletName: moduleName,
        name: constant.name.value,
        value: constant.value.bytes,
        type: constant.type.value
      }
    })
  }
}
