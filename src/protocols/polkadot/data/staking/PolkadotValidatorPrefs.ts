import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'

export class PolkadotValidatorPrefs {

    public static decode(raw: string): PolkadotValidatorPrefs {
        const decoder = new SCALEDecoder(raw)

        const commission = decoder.decodeNextCompactInt() // Perbill (parts per billion)
        
        return new PolkadotValidatorPrefs(commission.decoded)
    }
 
    private constructor(
        readonly commission: SCALECompactInt
    ) {}
}