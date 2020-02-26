import { SCALEType } from "./SCALEType"
import { isHex, stripHexPrefix } from "../../../../utils/hex"
import { decodeAddress, encodeAddress } from "../../utils/address"
import { SCALEDecodeResult } from "../SCALEDecoder"
import { isString } from "util"

export class SCALEAccountId extends SCALEType {
    public static from(value: string | Uint8Array | Buffer): SCALEAccountId {
        let buffer: Buffer
        if (isString(value)) {
            buffer = isHex(value) ? Buffer.from(value, 'hex') : decodeAddress(value)
        } else if (!Buffer.isBuffer(value)) {
            buffer = Buffer.from(value)
        } else {
            buffer = value
        }

        return new SCALEAccountId(buffer)
    }

    public static decode(hex: string): SCALEDecodeResult<SCALEAccountId> {
        const _hex = stripHexPrefix(hex)

        return {
            bytesDecoded: 32,
            decoded: SCALEAccountId.from(_hex.substr(0, 64))
        }
    }

    private constructor(readonly value: Buffer) { super() }

    public asAddress(): string {
        return encodeAddress(this.value)
    }

    public toString(): string {
        return this.value.toString('hex')
    }

    protected _encode(): string {
        return this.value.toString('hex')
    }
}