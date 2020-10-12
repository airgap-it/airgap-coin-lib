import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { supportedCalls, supportedConstants, supportedStorageEntries } from '../../../node/supported'
import { SCALEDecoder } from '../../scale/SCALEDecoder'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { SubstrateCall } from '../decorator/call/SubstrateCall'
import { SubstrateConstant } from '../decorator/constant/SubstrateConstant'
import { MetadataDecorator } from '../decorator/MetadataDecorator'
import { SubstrateStorageEntry } from '../decorator/storage/SubstrateStorageEntry'
import { MetadataVersioned } from '../MetadataVersioned'

import { MetadataCall } from './module/MetadataCall'
import { MetadataConstant } from './module/MetadataConstants'
import { MetadataModule } from './module/MetadataModule'
import { MetadataStorage } from './module/storage/MetadataStorage'
import { MetadataStorageEntry } from './module/storage/MetadataStorageEntry'

export class MetadataV11 extends MetadataVersioned {
  public static decode(network: SubstrateNetwork, raw: string): MetadataV11 {
    const decoder = new SCALEDecoder(network, raw)

    const magicNumber = decoder.decodeNextInt(32) // 32 bits
    const version = decoder.decodeNextInt(8) // 8 bits
    const modules = decoder.decodeNextArray(MetadataModule.decode)

    return new MetadataV11(magicNumber.decoded, version.decoded, modules.decoded) 
  }

  protected scaleFields = [this.magicNumber, this.version, this.modules]

  protected constructor(
    readonly magicNumber: SCALEInt, 
    readonly version: SCALEInt, 
    readonly modules: SCALEArray<MetadataModule>
  ) {
    super()
  }

  public decorate(): MetadataDecorator {
    const storageEntries: SubstrateStorageEntry[][] = []
    const calls: SubstrateCall[][] = []
    const constants: SubstrateConstant[][] = []

    let callModuleIndex: number = 0
    for (const module of this.modules.elements) {
      const moduleName: string = module.name.value

      const storagePrefix: string | undefined = module.storage.value?.prefix?.value
      if (storagePrefix && Object.keys(supportedStorageEntries).includes(storagePrefix)) {
        const decoratedEntries: SubstrateStorageEntry[] | undefined = this.createDecoratedStorageEntries(module.storage.value)
        if (decoratedEntries) {
          storageEntries.push(decoratedEntries)
        }
      }

      if (Object.keys(supportedCalls).includes(moduleName)) {
        const decoratedCalls: SubstrateCall[] = this.createDecoratedCalls(moduleName, callModuleIndex, module.calls.value?.elements || [])
        calls.push(decoratedCalls)
      }

      if (Object.keys(supportedConstants).includes(moduleName)) {
        const decoratedConstants: SubstrateConstant[] = this.createDecoratedConstants(moduleName, module.constants.elements)
        constants.push(decoratedConstants)
      }

      if (module.calls.value !== undefined) {
        callModuleIndex += 1
      }
    }

    return new MetadataDecorator(
      storageEntries.reduce((flatten: SubstrateStorageEntry[], next: SubstrateStorageEntry[]) => flatten.concat(next), []),
      calls.reduce((flatten: SubstrateCall[], next: SubstrateCall[]) => flatten.concat(next), []),
      constants.reduce((flatten: SubstrateConstant[], next: SubstrateConstant[]) => flatten.concat(next), []),
    )
  }

  private createDecoratedStorageEntries(storage: MetadataStorage | undefined): SubstrateStorageEntry[] | undefined {
    if (storage) {
      return storage.storageEntries.elements
        .filter((entry: MetadataStorageEntry) => supportedStorageEntries[storage.prefix.value].includes(entry.name.value))
        .map((entry: MetadataStorageEntry) => entry.type.decorate(storage.prefix.value, entry.name.value))
    }

    return undefined
  }

  private createDecoratedCalls(moduleName: string, moduleIndex: number, calls: MetadataCall[]): SubstrateCall[] {
    return calls.map((call: MetadataCall, index: number) => {
      return {
        moduleName,
        name: call.name.value,
        moduleIndex,
        callIndex: index
      }
    })
  }

  private createDecoratedConstants(moduleName: string, constants: MetadataConstant[]): SubstrateConstant[] {
    return constants.map((constant: MetadataConstant) => {
      return {
        moduleName,
        name: constant.name.value,
        value: constant.value.bytes,
        type: constant.type.value
      }
    })
  }

}