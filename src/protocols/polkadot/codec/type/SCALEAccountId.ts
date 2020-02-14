import { SCALEType } from "./SCALEType"
import { encodeAddress, decodeAddress } from "../../utils/address"
import { isHex } from "../../../../utils/hex"

export class SCALEAccountId extends SCALEType {
    public static from(value: string): SCALEAccountId {
        return new SCALEAccountId(isHex(value) ? value : decodeAddress(value).toString('hex'))
    }

    private constructor(readonly value: string) { super() }

    public asAddress(): string {
        return encodeAddress(this.value)
    }

    public toString(): string {
        return this.value
    }

    protected _encode(): string {
        return this.value
    }
}