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

    const lengths = this.migrateFieldLengths(network, runtimeVersion)

    const nonce = decoder.decodeNextInt(32)
    const consumers = decoder.decodeNextInt(lengths.consumers)
    const providers = decoder.decodeNextInt(lengths.providers)
    const sufficients = decoder.decodeNextInt(lengths.sufficients)
    const data = decoder.decodeNextObject(SubstrateAccountData.decode)

    return new SubstrateAccountInfo(nonce.decoded, consumers.decoded, providers.decoded, sufficients.decoded, data.decoded)
  }

  private static migrateFieldLengths(
    network: SubstrateNetwork,
    runtimeVersion: number | undefined
  ): { consumers: number; providers: number; sufficients: number } {
    if (runtimeVersion === undefined) {
      return {
        consumers: 32,
        providers: 32,
        sufficients: 32
      }
    }

    if (
      (network === SubstrateNetwork.KUSAMA && runtimeVersion >= 2030) ||
      (network === SubstrateNetwork.POLKADOT && runtimeVersion >= 30) ||
      (network === SubstrateNetwork.MOONBEAM && runtimeVersion >= 30)
    ) {
      return {
        consumers: 32,
        providers: 32,
        sufficients: 32
      }
    } else {
      return {
        consumers: 32,
        providers: 32,
        sufficients: 0
      }
    }
  }

  private constructor(
    readonly nonce: SCALEInt,
    readonly consumers: SCALEInt,
    readonly providers: SCALEInt,
    readonly sufficients: SCALEInt,
    readonly data: SubstrateAccountData
  ) {}
}
