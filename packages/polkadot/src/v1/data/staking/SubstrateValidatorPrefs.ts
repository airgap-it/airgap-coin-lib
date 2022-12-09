import { SCALECompactInt, SCALEDecoder } from '@airgap/substrate/v1'
import { PolkadotProtocolConfiguration } from '../../types/configuration'

export class SubstrateValidatorPrefs {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateValidatorPrefs {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const commission = decoder.decodeNextCompactInt() // Perbill (parts per billion)

    return new SubstrateValidatorPrefs(commission.decoded)
  }

  private constructor(readonly commission: SCALECompactInt) {}
}
