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
  public static decode(network: SubstrateNetwork, raw: string): SubstrateAccountInfo {
    const decoder = new SCALEDecoder(network, raw)

    const nonce = decoder.decodeNextInt(32)
    const refcount = decoder.decodeNextInt(8)
    const data = decoder.decodeNextObject(SubstrateAccountData.decode)

    return new SubstrateAccountInfo(nonce.decoded, refcount.decoded, data.decoded)
  }

  private constructor(readonly nonce: SCALEInt, readonly refcount: SCALEInt, readonly data: SubstrateAccountData) {}
}
