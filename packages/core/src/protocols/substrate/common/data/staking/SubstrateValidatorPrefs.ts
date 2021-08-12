import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALECompactInt } from '../scale/type/SCALECompactInt'

export class SubstrateValidatorPrefs {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateValidatorPrefs {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const commission = decoder.decodeNextCompactInt() // Perbill (parts per billion)

    return new SubstrateValidatorPrefs(commission.decoded)
  }

  private constructor(readonly commission: SCALECompactInt) {}
}
