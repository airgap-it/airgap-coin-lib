import { SCALEType } from "../SCALEType"
import { SCALECompactInt } from "../primitive/SCALECompactInt"
import { SCALEDecodeResult, DecoderMethod } from "../SCALEDecoder"

export class SCALEArray<T extends SCALEType> extends SCALEType {
    public static from<T extends SCALEType>(elements: T[]): SCALEArray<T> {
        return new SCALEArray(elements)
    }

    public static decode<T extends SCALEType>(hex: string, decodeElement: DecoderMethod<T>): SCALEDecodeResult<SCALEArray<T>> {
        let _hex = hex

        const arrayLength = SCALECompactInt.decode(hex)

        _hex = _hex.slice(arrayLength.bytesDecoded * 2)

        const elements: T[] = []
        let bytesDecoded = 0
        for (let i = 0; i < arrayLength.decoded.asNumber(); i++) {
            const element = decodeElement(_hex)
            elements.push(element.decoded)
            bytesDecoded += element.bytesDecoded
            _hex = _hex.slice(element.bytesDecoded * 2)
        }

        return {
            bytesDecoded: arrayLength.bytesDecoded + bytesDecoded,
            decoded: SCALEArray.from(elements)
        }
    }

    protected constructor(readonly elements: T[]) { super() }

    protected _encode(): string {
        return SCALECompactInt.from(this.elements.length).encode() + this.elements.map(element => element.encode()).join('')
    }
}