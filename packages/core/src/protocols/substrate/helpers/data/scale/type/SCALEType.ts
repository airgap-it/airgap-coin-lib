import { addHexPrefix } from '../../../../../../utils/hex'
import { SubstrateNetwork } from '../../../../SubstrateNetwork'

export interface SCALEEncodeConfig {
  withPrefix?: boolean
  network?: SubstrateNetwork
  runtimeVersion?: number
}

export abstract class SCALEType {
  public encode(config?: SCALEEncodeConfig): string {
    const encoded = this._encode(config)

    return config && config.withPrefix ? addHexPrefix(encoded) : encoded
  }

  public abstract toString(): string
  protected abstract _encode(config?: SCALEEncodeConfig): string
}
