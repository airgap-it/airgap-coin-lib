import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALEArray } from '../scale/type/SCALEArray'
import { SCALEBoolean } from '../scale/type/SCALEBoolean'
import { SCALEAccountId } from '../scale/type/SCALEAccountId'
import { SCALEInt } from '../scale/type/SCALEInt'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

export class SubstrateNominations {

    public static decode(network: SubstrateNetwork, raw: string): SubstrateNominations {
        const decoder = new SCALEDecoder(network, raw)

        const targets = decoder.decodeNextArray(SCALEAccountId.decode)
        const submittedIn = decoder.decodeNextInt(32)
        const suppressed = decoder.decodeNextBoolean()

        return new SubstrateNominations(targets.decoded, submittedIn.decoded, suppressed.decoded)
    }

    private constructor(
        readonly targets: SCALEArray<SCALEAccountId>,
        readonly submittedIn: SCALEInt,
        readonly suppressed: SCALEBoolean
    ) {}
}