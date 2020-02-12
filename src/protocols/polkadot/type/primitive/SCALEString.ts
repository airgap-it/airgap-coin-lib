import { SCALEType } from "../SCALEType"
import { SCALECompactInt } from "./SCALECompactInt"
import { SCALEDecodeResult } from "../SCALEDecoder"

export class SCALEString extends SCALEType {
    public static from(value: string): SCALEString {
        return new SCALEString(value)
    }

    public static decode(hex: string): SCALEDecodeResult<SCALEString> {
        let _hex = hex

        const length = SCALECompactInt.decode(_hex)

        _hex = _hex.substr(length.bytesDecoded * 2, length.decoded.asNumber() * 2)

        const decoded = new TextDecoder().decode(Buffer.from(_hex, 'hex'))
        
        return {
            bytesDecoded: length.bytesDecoded + length.decoded.asNumber(), // utf-8 encoding
            decoded: SCALEString.from(decoded)
        }
    }

    private constructor(readonly value: string) { super() }

    public toCamelCase(): string {
        return this.value
            .replace(/[-_]+/g, ' ')
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) => {
                return index === 0 ? match.toLowerCase() : match.toUpperCase()
            })
            .replace(/\s+/g, '')
    }

    protected _encode(): string {
        const encoded = new TextEncoder().encode(this.value)
        return SCALECompactInt.from(this.value.length).encode() + Buffer.from(encoded).toString('hex')
    }
}