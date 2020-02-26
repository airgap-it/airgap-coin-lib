import { SCALEType } from "./SCALEType";
import { DecoderMethod, SCALEDecodeResult } from "../SCALEDecoder";
import { stripHexPrefix } from "../../../../utils/hex";

export class SCALETuple<T extends SCALEType, R extends SCALEType> extends SCALEType {

    public static from<T extends SCALEType, R extends SCALEType>(first: T, second: R): SCALETuple<T, R>
    public static from<T extends SCALEType, R extends SCALEType>(tuple: [T, R]): SCALETuple<T, R>
    public static from<T extends SCALEType, R extends SCALEType>(firstParam: T | [T, R], secondParam?: R): SCALETuple<T, R> {
        if (secondParam !== undefined) {
            return new SCALETuple(firstParam as T, secondParam)
        } else {
            return new SCALETuple(firstParam[0], firstParam[1])
        }
    }

    public static decode<T extends SCALEType, R extends SCALEType>(hex: string, decodeFirst: DecoderMethod<T>, decodeSecond: DecoderMethod<R>): SCALEDecodeResult<SCALETuple<T, R>> {
        const _hex = stripHexPrefix(hex)

        const first = decodeFirst(_hex)
        const second = decodeSecond(_hex.slice(first.bytesDecoded * 2))

        return {
            bytesDecoded: first.bytesDecoded + second.bytesDecoded,
            decoded: SCALETuple.from(first.decoded, second.decoded)
        }
    }

    private constructor(
        readonly first: T,
        readonly second: R
    ) { super() }

    public toString(): string {
        return `(${this.first.toString()}, ${this.second.toString()})`
    }

    protected _encode(): string {
        return this.first.encode() + this.second.encode()
    }
}