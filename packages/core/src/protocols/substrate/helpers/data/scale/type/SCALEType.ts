import { addHexPrefix } from '../../../../../../utils/hex'

export interface SCALEEncodeConfig {
  withPrefix: boolean
}

export abstract class SCALEType {
  public encode(config?: SCALEEncodeConfig): string {
    const encoded = this._encode()

    return config && config.withPrefix ? addHexPrefix(encoded) : encoded
  }

  public abstract toString(): string
  protected abstract _encode(): string
}
