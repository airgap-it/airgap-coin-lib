import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'

export class SubstrateValidatorPrefs {
  public static decode(network: SubstrateNetwork, runtimeVersion: number | undefined, raw: string): SubstrateValidatorPrefs {
    const decoder = new SCALEDecoder(network, raw)

    const commission = decoder.decodeNextCompactInt() // Perbill (parts per billion)

    return new SubstrateValidatorPrefs(commission.decoded)
  }

  private constructor(readonly commission: SCALECompactInt) {}
}
