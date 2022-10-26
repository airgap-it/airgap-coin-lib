import { SCALEClass } from '../../scale/type/SCALEClass'
import { SCALECompactInt } from '../../scale/type/SCALECompactInt'
import { SCALEType } from '../../scale/type/SCALEType'

export abstract class MetadataV14Component extends SCALEClass {
  protected scaleFields: SCALEType[] = [this.type]

  protected constructor(readonly type: SCALECompactInt) {
    super()
  }
}
