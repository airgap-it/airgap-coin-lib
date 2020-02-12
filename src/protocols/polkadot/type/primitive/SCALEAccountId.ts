import { SCALEType } from "../SCALEType"
import { encodeAddress } from "../../utils/address"

export class SCALEAccountId extends SCALEType {
    public static from(publicKey: string): SCALEAccountId {
        return new SCALEAccountId(publicKey)
    }

    private constructor(readonly value: string) { super() }

    public asAddress(): string {
        return encodeAddress(this.value)
    }

    protected _encode(): string {
        return this.value
    }
}