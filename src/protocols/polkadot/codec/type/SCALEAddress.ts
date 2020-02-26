import { SCALEType } from "./SCALEType"
import { encodeAddress, decodeAddress } from "../../utils/address"
import { isHex, stripHexPrefix } from "../../../../utils/hex"
import { SCALEDecodeResult } from "../SCALEDecoder"

const ENCODED_ADDRESS_PREFIX = 'ff'

export class SCALEAddress extends SCALEType {
    public static from(value: string): SCALEAddress {
        return new SCALEAddress(isHex(value) ? value : decodeAddress(value).toString('hex'))
    }

    public static decode(hex: string): SCALEDecodeResult<SCALEAddress> {
        const _hex = stripHexPrefix(hex)
        
        const prefix = _hex.substr(0, 2)
        if (prefix !== ENCODED_ADDRESS_PREFIX) {
            throw new Error('Invalid address value')
        }

        return {
            bytesDecoded: 33,
            decoded: SCALEAddress.from(_hex.substr(2, 64))
        }
    }

    private constructor(readonly accountId: string) { super() }

    public asAddress(): string {
        return encodeAddress(this.accountId)
    }

    public toString(): string {
        return this.accountId
    }

    protected _encode(): string {
        return ENCODED_ADDRESS_PREFIX + this.accountId
    }
}