// tslint:disable: max-classes-per-file
import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEInt } from '../scale/type/SCALEInt'

class SubstrateAccountData {
  public static decode<Network extends SubstrateNetwork>(
    network: Network,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<SubstrateAccountData> {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const free = decoder.decodeNextInt(128)
    const reserved = decoder.decodeNextInt(128)
    const miscFrozen = decoder.decodeNextInt(128)
    const feeFrozen = decoder.decodeNextInt(128)

    return {
      bytesDecoded: free.bytesDecoded + reserved.bytesDecoded + miscFrozen.bytesDecoded + feeFrozen.bytesDecoded,
      decoded: new SubstrateAccountData(free.decoded, reserved.decoded, miscFrozen.decoded, feeFrozen.decoded)
    }
  }

  private constructor(readonly free: SCALEInt, readonly reserved: SCALEInt, readonly miscFrozen: SCALEInt, readonly feeFrozen: SCALEInt) {}
}

export class SubstrateAccountInfo {
  public static decode(network: SubstrateNetwork, runtimeVersion: number | undefined, raw: string): SubstrateAccountInfo {
    const decoder = new SCALEDecoder(network, runtimeVersion, raw)

    const nonce = decoder.decodeNextInt(32)
    const consumers = decoder.decodeNextInt(32)
    const providers = decoder.decodeNextInt(32)
    const sufficients = decoder.decodeNextInt(32)
    const data = decoder.decodeNextObject(SubstrateAccountData.decode)

    return new SubstrateAccountInfo(nonce.decoded, consumers.decoded, providers.decoded, sufficients.decoded, data.decoded)
  }

  private constructor(
    readonly nonce: SCALEInt,
    readonly consumers: SCALEInt,
    readonly providers: SCALEInt,
    readonly sufficients: SCALEInt,
    readonly data: SubstrateAccountData
  ) {}
}
