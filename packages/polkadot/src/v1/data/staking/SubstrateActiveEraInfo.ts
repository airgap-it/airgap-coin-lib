import { SCALEDecoder, SCALEInt, SCALEOptional } from '@airgap/substrate/v1'
import { PolkadotProtocolConfiguration } from '../../types/configuration'

export class SubstrateActiveEraInfo {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateActiveEraInfo {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const index = decoder.decodeNextInt(32)
    const start = decoder.decodeNextOptional((_configuration, _runtimeVersion, hex) => SCALEInt.decode(hex, 64))

    return new SubstrateActiveEraInfo(index.decoded, start.decoded)
  }

  private constructor(readonly index: SCALEInt, readonly start: SCALEOptional<SCALEInt>) {}
}
