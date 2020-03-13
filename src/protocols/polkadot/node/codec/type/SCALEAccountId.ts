import { SCALEType } from "./SCALEType"
import { SCALEDecodeResult } from "../SCALEDecoder"
import { isString } from "util"
import { stripHexPrefix } from "../../../../../utils/hex"
import { PolkadotAddress } from '../../../account/PolkadotAddress'

export class SCALEAccountId extends SCALEType {
    public static from(value: string | Uint8Array | Buffer): SCALEAccountId {
        const address: PolkadotAddress = isString(value) ? PolkadotAddress.fromEncoded(value) : PolkadotAddress.fromBytes(value)
        return new SCALEAccountId(address)
    }

    public static decode(hex: string): SCALEDecodeResult<SCALEAccountId> {
        const _hex = stripHexPrefix(hex)

        return {
            bytesDecoded: 32,
            decoded: SCALEAccountId.from(_hex.substr(0, 64))
        }
    }

    private constructor(readonly address: PolkadotAddress) { super() }

    public asAddress(): string {
        return this.address.toString()
    }

    public asBytes(): Buffer {
        return this.address.getBufferPublicKey()
    }

    public toString(): string {
        return this.address.getHexPublicKey()
    }

    protected _encode(): string {
        return this.address.getHexPublicKey()
    }
}