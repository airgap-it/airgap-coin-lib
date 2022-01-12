import { SCALEDecoder, SCALEDecodeResult } from '../../../common/data/scale/SCALEDecoder'
import { SCALEAccountId } from '../../../common/data/scale/type/SCALEAccountId'
import { SCALEArray } from '../../../common/data/scale/type/SCALEArray'
import { SCALEClass } from '../../../common/data/scale/type/SCALEClass'
import { SCALEInt } from '../../../common/data/scale/type/SCALEInt'
import { SCALETuple } from '../../../common/data/scale/type/SCALETuple'
import { SCALEType } from '../../../common/data/scale/type/SCALEType'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

import { MoonbeamDelegationRequest } from './MoonbeamDelegationRequest'

export class MoonbeamPendingDelegationRequests extends SCALEClass {
  public static decode(runtimeVersion: number | undefined, raw: string): SCALEDecodeResult<MoonbeamPendingDelegationRequests> {
    const decoder = new SCALEDecoder(SubstrateNetwork.MOONBEAM, runtimeVersion, raw)

    const revocationsCount = decoder.decodeNextInt(32)
    const requests = decoder.decodeNextArray((network, runtimeVersion, hex) =>
      SCALETuple.decode(
        network,
        runtimeVersion,
        hex,
        (firstNetwork, _, first) => SCALEAccountId.decode(firstNetwork, first, 20),
        (_, secondRuntimeVersion, second) => MoonbeamDelegationRequest.decode(secondRuntimeVersion, second)
      )
    )
    const lessTotal = decoder.decodeNextInt(128)

    return {
      bytesDecoded: revocationsCount.bytesDecoded + requests.bytesDecoded + lessTotal.bytesDecoded,
      decoded: new MoonbeamPendingDelegationRequests(revocationsCount.decoded, requests.decoded, lessTotal.decoded)
    }
  }

  protected scaleFields: SCALEType[] = [this.revocationsCount]

  private constructor(
    public readonly revocationsCount: SCALEInt,
    public readonly requests: SCALEArray<SCALETuple<SCALEAccountId<SubstrateNetwork.MOONBEAM>, MoonbeamDelegationRequest>>,
    public readonly lessTotal: SCALEInt
  ) {
    super()
  }
}
