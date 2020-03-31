import { SCALEDecodeResult, SCALEDecoder } from '../scale/SCALEDecoder'
import { SCALEInt } from '../scale/type/SCALEInt'

class PolkadotAccountData {

    public static decode(raw: string): SCALEDecodeResult<PolkadotAccountData> {
        const decoder = new SCALEDecoder(raw)

        const free = decoder.decodeNextInt(128)
        const reserved = decoder.decodeNextInt(128)
        const miscFrozen = decoder.decodeNextInt(128)
        const freeFrozen = decoder.decodeNextInt(128)

        return {
            bytesDecoded: free.bytesDecoded + reserved.bytesDecoded + miscFrozen.bytesDecoded + freeFrozen.bytesDecoded,
            decoded: new PolkadotAccountData(free.decoded, reserved.decoded, miscFrozen.decoded, freeFrozen.decoded)
        }
    }

    private constructor(
        readonly free: SCALEInt,
        readonly reserved: SCALEInt,
        readonly miscFrozen: SCALEInt,
        readonly feeFrozen: SCALEInt
    ) {}
}

export class PolkadotAccountInfo {

    public static decode(raw: string): PolkadotAccountInfo {
        const decoder = new SCALEDecoder(raw)
        
        const nonce = decoder.decodeNextInt(32)
        const refcount = decoder.decodeNextInt(8)
        const data = decoder.decodeNextObject(PolkadotAccountData.decode)

        return new PolkadotAccountInfo(nonce.decoded, refcount.decoded, data.decoded)
    }

    private constructor(
        readonly nonce: SCALEInt,
        readonly refcount: SCALEInt,
        readonly data: PolkadotAccountData
    ) {}
}