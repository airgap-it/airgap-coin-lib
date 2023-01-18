import { addHexPrefix } from '@airgap/coinlib-core/utils/hex'
import { SubstrateProtocolConfiguration } from '../../../types/configuration'

export interface SCALEEncodeConfig {
  withPrefix?: boolean
  configuration?: SubstrateProtocolConfiguration
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
