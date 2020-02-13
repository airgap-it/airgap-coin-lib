import { SCALEType } from "./SCALEType"
import { encodeAddress, decodeAddress } from "../../utils/address"
import { isHex } from "../../../../utils/hex"

export class SCALEAddress extends SCALEType {
    public static from(value: string): SCALEAddress {
        return new SCALEAddress(isHex(value) ? value : decodeAddress(value).toString('hex'))
    }

    private constructor(readonly accountId: string) { super() }

    public asAddress(): string {
        return encodeAddress(this.accountId)
    }

    protected _encode(): string {
        return 'ff' + this.accountId
    }
}