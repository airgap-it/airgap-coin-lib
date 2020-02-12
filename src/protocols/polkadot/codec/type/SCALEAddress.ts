import { SCALEType } from "./SCALEType"
import { encodeAddress } from "../../utils/address"

export class SCALEAddress extends SCALEType {
    public static from(publicKey: string): SCALEAddress {
        return new SCALEAddress(publicKey)
    }

    private constructor(readonly accountId: string) { super() }

    public asAddress(): string {
        return encodeAddress(this.accountId)
    }

    protected _encode(): string {
        return 'ff' + this.accountId
    }
}