import { SCALEBoolean } from "./primitive/SCALEBoolean";
import { SCALEType } from "./SCALEType";
import { SCALEBytes } from "./primitive/SCALEBytes";
import { SCALECompactInt } from "./primitive/SCALECompactInt";
import { SCALEInt } from "./primitive/SCALEInt";
import { SCALEOptional } from "./primitive/SCALEOptional";
import { SCALEArray } from "./collection/SCALEArray";
import { SCALEString } from "./primitive/SCALEString";
import { SCALEEnum } from "./scaleEnum";
import { stripHexPrefix } from "../../../utils/hex";

export type DecoderMethod<T> = (hex: string) => SCALEDecodeResult<T>

export interface SCALEDecodeResult<T> {
    bytesDecoded: number,
    decoded: T
}

export class SCALEDecoder {
    private hex: string

    constructor(hex: string) {
        this.hex = stripHexPrefix(hex)
    }

    public decodeNextArray<T extends SCALEType>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<SCALEArray<T>> {
        return this.decodeNextValue(hex => SCALEArray.decode(hex, decoderMethod))
    }

    public decodeNextBoolean(): SCALEDecodeResult<SCALEBoolean> {
        return this.decodeNextValue(SCALEBoolean.decode)
    }

    public decodeNextBytes(): SCALEDecodeResult<SCALEBytes> {
        return this.decodeNextValue(SCALEBytes.decode)
    }

    public decodeNextCompactInt(): SCALEDecodeResult<SCALECompactInt> {
        return this.decodeNextValue(SCALECompactInt.decode)
    }

    public decodeNextInt(bitLength: number): SCALEDecodeResult<SCALEInt> {
        const nibbles = Math.ceil(bitLength / 4)
        return this.decodeNextValue(SCALEInt.decode, nibbles)
    }

    public decodeNextOptional<T extends SCALEType>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<SCALEOptional<T>> {
        return this.decodeNextValue(hex => SCALEOptional.decode(hex, decoderMethod))
    }

    public decodeNextString(): SCALEDecodeResult<SCALEString> {
        return this.decodeNextValue(SCALEString.decode)
    }

    public decodeNextEnum<T>(getEnumValue: (value: number) => T | null): SCALEDecodeResult<SCALEEnum<T>> {
        return this.decodeNextValue(hex => SCALEEnum.decode(hex, getEnumValue))
    }

    public decodeNextObject<T extends SCALEType>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<T> {
        return this.decodeNextValue(decoderMethod)
    }

    private decodeNextValue<T extends SCALEType>(decoderMethod: DecoderMethod<T>, nibbleLength?: number): SCALEDecodeResult<T> {
        const decoded = decoderMethod(this.hex.substr(0, nibbleLength))
        this.moveCursor(decoded.bytesDecoded)
        return decoded
    }

    private moveCursor(bytes: number) {
        this.hex = this.hex.slice(bytes * 2)
    }
}