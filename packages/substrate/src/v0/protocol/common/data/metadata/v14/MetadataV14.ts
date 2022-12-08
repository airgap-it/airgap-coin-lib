import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SCALEDecoder } from '../../scale/SCALEDecoder'
import { SCALEArray } from '../../scale/type/SCALEArray'
import { SCALECompactInt } from '../../scale/type/SCALECompactInt'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { SubstrateCall } from '../decorator/call/SubstrateCall'
import { SubstrateConstant } from '../decorator/constant/SubstrateConstant'
import { MetadataDecorator } from '../decorator/MetadataDecorator'
import { SubstrateStorageEntry } from '../decorator/storage/SubstrateStorageEntry'
import { MetadataVersioned } from '../MetadataVersioned'

import { MetadataV14Exstrinsic } from './extrinsic/MetadataV14Extrinsic'
import { MetadataV14Call } from './pallet/MetadataV14Call'
import { MetadataV14Constant } from './pallet/MetadataV14Constant'
import { MetadataV14Pallet } from './pallet/MetadataV14Pallet'
import { MetadataV14Storage } from './pallet/storage/MetadataV14Storage'
import { MetadataV14StorageEntry } from './pallet/storage/MetadataV14StorageEntry'
import { MetadataV14PortableRegistry } from './registry/MetadataV14PortableRegistry'
import { MetadataV14SiVariant } from './registry/si/MetadataV14SiVariant'
import { MetadataV14SiVariantTypeDef } from './registry/si/MetadataV14TypeDef'

export class MetadataV14 extends MetadataVersioned {
  public static decode<Network extends SubstrateNetwork>(network: Network, runtimeVersion: number | undefined, raw: string): MetadataV14 {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const magicNumber = decoder.decodeNextInt(32) // 32 bits
    const version = decoder.decodeNextInt(8) // 8 bits
    const lookup = decoder.decodeNextObject(MetadataV14PortableRegistry.decode)
    const pallets = decoder.decodeNextArray(MetadataV14Pallet.decode)
    const extrinsics = decoder.decodeNextObject(MetadataV14Exstrinsic.decode)
    const type = decoder.decodeNextCompactInt()

    return new MetadataV14(magicNumber.decoded, version.decoded, lookup.decoded, pallets.decoded, extrinsics.decoded, type.decoded)
  }

  protected constructor(
    readonly magicNumber: SCALEInt,
    readonly version: SCALEInt,
    readonly lookup: MetadataV14PortableRegistry,
    readonly pallets: SCALEArray<MetadataV14Pallet>,
    readonly extrinsics: MetadataV14Exstrinsic,
    readonly type: SCALECompactInt
  ) {
    super()
  }

  public decorate(supportedStorageEntries: Object, supportedCalls: Object, supportedConstants: Object): MetadataDecorator {
    const storageEntries: SubstrateStorageEntry[][] = []
    const calls: SubstrateCall[][] = []
    const constants: SubstrateConstant[][] = []

    for (const pallet of this.pallets.elements) {
      const palletName: string = pallet.name.value

      const storagePrefix: string | undefined = pallet.storage.value?.prefix?.value
      if (storagePrefix && Object.keys(supportedStorageEntries).includes(storagePrefix)) {
        const decoratedEntries: SubstrateStorageEntry[] | undefined = this.createDecoratedStorageEntries(
          pallet.storage.value,
          supportedStorageEntries
        )
        if (decoratedEntries) {
          storageEntries.push(decoratedEntries)
        }
      }

      if (Object.keys(supportedCalls).includes(palletName)) {
        const decoratedCalls: SubstrateCall[] = this.createDecoratedCalls(palletName, pallet.index.toNumber(), pallet.calls.value)
        calls.push(decoratedCalls)
      }

      if (Object.keys(supportedConstants).includes(palletName)) {
        const decoratedConstants: SubstrateConstant[] = this.createDecoratedConstants(palletName, pallet.constants.elements)
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
    storage: MetadataV14Storage | undefined,
    supportedStorageEntries: Object
  ): SubstrateStorageEntry[] | undefined {
    if (storage) {
      return storage.storageEntries.elements
        .filter((entry: MetadataV14StorageEntry) => supportedStorageEntries[storage.prefix.value].includes(entry.name.value))
        .map((entry: MetadataV14StorageEntry) => entry.type.decorate(storage.prefix.value, entry.name.value))
    }

    return undefined
  }

  private createDecoratedCalls(palletName: string, palletIndex: number, calls: MetadataV14Call | undefined): SubstrateCall[] {
    const callsTypeDef = calls ? this.lookup.get(calls.type.toString())?.type?.def : undefined
    if (!callsTypeDef) {
      return []
    }

    if (callsTypeDef instanceof MetadataV14SiVariantTypeDef) {
      return callsTypeDef.variants.elements.map((variant: MetadataV14SiVariant) => {
        return {
          palletName,
          name: variant.name.value,
          palletIndex,
          callIndex: variant.index.toNumber()
        }
      })
    } else {
      return []
    }
  }

  private createDecoratedConstants(palletName: string, constants: MetadataV14Constant[]): SubstrateConstant[] {
    return constants.map((constant: MetadataV14Constant) => {
      return {
        palletName,
        name: constant.name.value,
        value: constant.value.bytes,
        type: constant.type.toString()
      }
    })
  }
}
