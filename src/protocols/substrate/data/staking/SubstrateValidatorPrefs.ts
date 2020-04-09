import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'

export class SubstrateValidatorPrefs {

    public static decode(raw: string): SubstrateValidatorPrefs {
        const decoder = new SCALEDecoder(raw)

        const commission = decoder.decodeNextCompactInt() // Perbill (parts per billion)
        
        return new SubstrateValidatorPrefs(commission.decoded)
    }
 
    private constructor(
        readonly commission: SCALECompactInt
    ) {}
}