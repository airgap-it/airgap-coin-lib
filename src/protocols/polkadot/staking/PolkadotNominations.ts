import { SCALEDecoder } from '../node/codec/SCALEDecoder'
import { SCALEArray } from '../node/codec/type/SCALEArray'
import { SCALEString } from '../node/codec/type/SCALEString'
import { SCALEBoolean } from '../node/codec/type/SCALEBoolean'

export class PolkadotNominations {

    public static decode(raw: string): PolkadotNominations {
        const decoder = new SCALEDecoder(raw)

        const targets = decoder.decodeNextArray(SCALEString.decode)
        decoder.decodeNextInt(32) // submitted in
        const suppressed = decoder.decodeNextBoolean()

        return new PolkadotNominations(targets.decoded, suppressed.decoded)
    }

    private constructor(
        readonly targets: SCALEArray<SCALEString>,
        readonly suppressed: SCALEBoolean
    ) {}
}