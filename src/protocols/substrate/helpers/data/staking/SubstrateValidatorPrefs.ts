import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

export class SubstrateValidatorPrefs {

    public static decode(network: SubstrateNetwork, raw: string): SubstrateValidatorPrefs {
        const decoder = new SCALEDecoder(network, raw)

        const commission = decoder.decodeNextCompactInt() // Perbill (parts per billion)
        
        return new SubstrateValidatorPrefs(commission.decoded)
    }
 
    private constructor(
        readonly commission: SCALECompactInt
    ) {}
}