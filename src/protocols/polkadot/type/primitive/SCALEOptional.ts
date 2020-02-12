import { SCALEType } from "../SCALEType"
import { toHexStringRaw } from "../../../../utils/hex"
import { SCALEDecodeResult, DecoderMethod } from "../SCALEDecoder"

enum Optional {
    None = 0,
    Some
}

export class SCALEOptional<T extends SCALEType> extends SCALEType {
    public static empty<T extends SCALEType>(): SCALEOptional<T> {
        return new SCALEOptional<T>(null)
    }

    public static from<T extends SCALEType>(value: T): SCALEOptional<T> {
        return new SCALEOptional(value)
    }

    public static decode<T extends SCALEType>(hex: string, decodeValue: DecoderMethod<T>): SCALEDecodeResult<SCALEOptional<T>> {
        const prefix = parseInt(hex.substr(0, 2), 16)
        switch (prefix) {
            case Optional.None:
                return {
                    bytesDecoded: 1,
                    decoded: SCALEOptional.empty()
                }
            case Optional.Some:
                const value = decodeValue(hex.slice(2))
                return {
                    bytesDecoded: 1 + value.bytesDecoded,
                    decoded: SCALEOptional.from(value.decoded)
                }
            default:
                throw new Error('Unknown optional type')
        }
    }

    private readonly type: Optional

    public get hasValue(): boolean {
        return this._value !== null
    }

    public get value(): T {
        if (this.hasValue) {
            return this._value!
        } else {
            throw new Error('SCALEOptional is empty')
        }
    }

    private constructor(readonly _value: T | null) { 
        super()
        this.type = _value ? 1 : 0
     }

    protected _encode(): string {
        return toHexStringRaw(this.type, 2) + this.hasValue ? this.value.encode() : ''
    }
}