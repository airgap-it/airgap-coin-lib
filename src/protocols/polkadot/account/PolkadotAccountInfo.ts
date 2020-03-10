import { SCALEDecoder, SCALEDecodeResult } from "../codec/SCALEDecoder";
import { SCALEInt } from "../codec/type/SCALEInt";

class PolkadotAccoountData {

    public static decode(raw: string): SCALEDecodeResult<PolkadotAccoountData> {
        const decoder = new SCALEDecoder(raw)

        const free = decoder.decodeNextInt(128)
        const reserved = decoder.decodeNextInt(128)
        const miscFrozen = decoder.decodeNextInt(128)
        const freeFrozen = decoder.decodeNextInt(128)

        return {
            bytesDecoded: free.bytesDecoded + reserved.bytesDecoded + miscFrozen.bytesDecoded + freeFrozen.bytesDecoded,
            decoded: new PolkadotAccoountData(free.decoded, reserved.decoded, miscFrozen.decoded, freeFrozen.decoded)
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
        const data = decoder.decodeNextObject(PolkadotAccoountData.decode)

        return new PolkadotAccountInfo(nonce.decoded, refcount.decoded, data.decoded)
    }

    private constructor(
        readonly nonce: SCALEInt,
        readonly refcount: SCALEInt,
        readonly data: PolkadotAccoountData
    ) {}
}