import { SCALEAccountId, SCALEArray, SCALEBoolean, SCALEDecoder, SCALEInt } from '@airgap/substrate/v1'
import { PolkadotProtocolConfiguration } from '../../types/configuration'

export class SubstrateNominations<C extends PolkadotProtocolConfiguration = PolkadotProtocolConfiguration> {
  public static decode<C extends PolkadotProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateNominations<C> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const targets = decoder.decodeNextArray((configuration, _, hex) => SCALEAccountId.decode(configuration, hex))
    const submittedIn = decoder.decodeNextInt(32)
    const suppressed = decoder.decodeNextBoolean()

    return new SubstrateNominations(targets.decoded, submittedIn.decoded, suppressed.decoded)
  }

  private constructor(readonly targets: SCALEArray<SCALEAccountId<C>>, readonly submittedIn: SCALEInt, readonly suppressed: SCALEBoolean) {}
}
