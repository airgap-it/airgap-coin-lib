import { SCALEDecoder } from '../node/codec/SCALEDecoder'
import { SCALEArray } from '../node/codec/type/SCALEArray'
import { SCALEBoolean } from '../node/codec/type/SCALEBoolean'
import { SCALEAccountId } from '../node/codec/type/SCALEAccountId'

export class PolkadotNominations {

    public static decode(raw: string): PolkadotNominations {
        const decoder = new SCALEDecoder(raw)

        const targets = decoder.decodeNextArray(SCALEAccountId.decode)
        decoder.decodeNextInt(32) // submitted in
        const suppressed = decoder.decodeNextBoolean()

        return new PolkadotNominations(targets.decoded, suppressed.decoded)
    }

    private constructor(
        readonly targets: SCALEArray<SCALEAccountId>,
        readonly suppressed: SCALEBoolean
    ) {}
}