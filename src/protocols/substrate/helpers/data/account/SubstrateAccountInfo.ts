// tslint:disable: max-classes-per-file
import { SubstrateNetwork } from '../../../SubstrateNetwork'
import { SCALEDecoder, SCALEDecodeResult } from '../scale/SCALEDecoder'
import { SCALEInt } from '../scale/type/SCALEInt'

class SubstrateAccountData {
  public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<SubstrateAccountData> {
    const decoder = new SCALEDecoder(network, raw)

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
    const decoder = new SCALEDecoder(network, raw)

    const nonce = decoder.decodeNextInt(32)
    const refcount = decoder.decodeNextInt(this.migrateRefcountLength(network, runtimeVersion))
    const data = decoder.decodeNextObject(SubstrateAccountData.decode)

    return new SubstrateAccountInfo(nonce.decoded, refcount.decoded, data.decoded)
  }

  private static migrateRefcountLength(network: SubstrateNetwork, runtimeVersion: number | undefined): number {
    if (runtimeVersion === undefined) {
      return 32
    }

    if (network === SubstrateNetwork.KUSAMA && runtimeVersion >= 2025 || network === SubstrateNetwork.POLKADOT && runtimeVersion >= 25) {
      return 32
    } else {
      return 8
    }
  }

  private constructor(readonly nonce: SCALEInt, readonly refcount: SCALEInt, readonly data: SubstrateAccountData) {}
}
