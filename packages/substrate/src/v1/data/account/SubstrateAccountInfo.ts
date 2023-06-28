// tslint:disable: max-classes-per-file
import { SubstrateProtocolConfiguration } from '../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEInt } from '../scale/type/SCALEInt'

class SubstrateAccountData {
  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    raw: string
  ): SCALEDecodeResult<SubstrateAccountData> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const free = decoder.decodeNextInt(128)
    const reserved = decoder.decodeNextInt(128)
    const frozen = decoder.decodeNextInt(128)
    const flags = decoder.decodeNextInt(128)

    return {
      bytesDecoded: free.bytesDecoded + reserved.bytesDecoded + frozen.bytesDecoded + flags.bytesDecoded,
      decoded: new SubstrateAccountData(free.decoded, reserved.decoded, frozen.decoded, flags.decoded)
    }
  }

  private constructor(readonly free: SCALEInt, readonly reserved: SCALEInt, readonly frozen: SCALEInt, readonly flags: unknown) {}
}

export class SubstrateAccountInfo {
  public static decode(
    configuration: SubstrateProtocolConfiguration,
    runtimeVersion: number | undefined,
    raw: string
  ): SubstrateAccountInfo {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

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
