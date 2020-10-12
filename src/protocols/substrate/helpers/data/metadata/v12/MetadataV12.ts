import { SubstrateNetwork } from '../../../../SubstrateNetwork'
import { SCALEDecoder } from '../../scale/SCALEDecoder'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { MetadataDecorator } from '../decorator/MetadataDecorator'
import { MetadataVersioned } from '../MetadataVersioned'

export class MetadataV12 extends MetadataVersioned {
  public static decode(network: SubstrateNetwork, raw: string): MetadataV12 {
    const decoder = new SCALEDecoder(network, raw)

    const magicNumber = decoder.decodeNextInt(32) // 32 bits
    const version = decoder.decodeNextInt(8) // 8 bits

    return new MetadataV12(magicNumber.decoded, version.decoded) 
  }

  protected scaleFields = [this.magicNumber, this.version]

  protected constructor(
    readonly magicNumber: SCALEInt, 
    readonly version: SCALEInt, 
  ) {
    super()
  }

  public decorate(): MetadataDecorator {
    throw new Error('Method not implemented.')
  }
}