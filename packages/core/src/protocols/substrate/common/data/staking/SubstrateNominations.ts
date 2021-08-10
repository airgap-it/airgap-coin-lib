import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALEBoolean } from '../scale/type/SCALEBoolean'
import { SCALEInt } from '../scale/type/SCALEInt'

export class SubstrateNominations<Network extends SubstrateNetwork> {
  public static decode<Network extends SubstrateNetwork>(
    network: Network, 
    runtimeVersion: number | undefined, 
    raw: string
  ): SubstrateNominations<Network> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const targets = decoder.decodeNextArray((network, _, hex) => SCALEAccountId.decode(network, hex))
    const submittedIn = decoder.decodeNextInt(32)
    const suppressed = decoder.decodeNextBoolean()

    return new SubstrateNominations(targets.decoded, submittedIn.decoded, suppressed.decoded)
  }

  private constructor(
    readonly targets: SCALEArray<SCALEAccountId<Network>>, 
    readonly submittedIn: SCALEInt, 
    readonly suppressed: SCALEBoolean
  ) {}
}
