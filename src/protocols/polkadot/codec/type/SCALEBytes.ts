import { SCALEType } from "../type/SCALEType"
import { SCALECompactInt } from "./SCALECompactInt"
import { isString } from "util"
import { isHex, stripHexPrefix } from "../../../../utils/hex"
import { SCALEDecodeResult } from "../SCALEDecoder"

export class SCALEBytes extends SCALEType {

    public static from(bytes: string | Buffer | Uint8Array): SCALEBytes {
        let buffer: Buffer
        if (isString(bytes) && isHex(bytes)) {
            buffer = Buffer.from(stripHexPrefix(bytes), 'hex')
        } else if (!isString(bytes)) {
            buffer = Buffer.from(bytes)
        } else {
            throw new Error('Unknown bytes type.')
        }

        return new SCALEBytes(buffer)
    }

    public static decode(hex: string): SCALEDecodeResult<SCALEBytes> {
        let _hex = hex

        const length = SCALECompactInt.decode(_hex)
        const bytes = _hex.substr(length.bytesDecoded * 2, length.decoded.toNumber() * 2)

        return {
            bytesDecoded: length.bytesDecoded + length.decoded.toNumber(),
            decoded: SCALEBytes.from(bytes)
        }
    }

    private constructor(readonly bytes: Buffer) { super() }

    public toString(encoding: string = 'hex'): string {
        return this.bytes.toString(encoding)
    }

    protected _encode(): string {
        return SCALECompactInt.from(this.bytes.length).encode() + this.bytes.toString('hex')
    }
}