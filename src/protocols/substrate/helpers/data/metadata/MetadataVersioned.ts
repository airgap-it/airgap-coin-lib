import { SCALEInt } from '../scale/type/SCALEInt'

import { MetadataDecorator } from './decorator/MetadataDecorator'

export abstract class MetadataVersioned {
  public abstract readonly version: SCALEInt

  public abstract decorate(): MetadataDecorator
}