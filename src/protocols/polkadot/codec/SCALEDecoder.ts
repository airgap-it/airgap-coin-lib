import { SCALEBoolean } from "./type/SCALEBoolean";
import { SCALEType } from "./type/SCALEType";
import { SCALEBytes } from "./type/SCALEBytes";
import { SCALECompactInt } from "./type/SCALECompactInt";
import { SCALEInt } from "./type/SCALEInt";
import { SCALEOptional } from "./type/SCALEOptional";
import { SCALEArray } from "./type/SCALEArray";
import { SCALEString } from "./type/SCALEString";
import { SCALEEnum } from "./type/SCALEEnum";
import { stripHexPrefix } from "../../../utils/hex";
import { SCALEHash } from "./type/SCALEHash";
import { SCALEAddress } from "./type/SCALEAddress";
import { SCALEEra } from "./type/SCALEEra";

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

    public decodeNextAddress(): SCALEDecodeResult<SCALEAddress> {
        return this.decodeNextValue(SCALEAddress.decode)
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

    public decodeNextEra(): SCALEDecodeResult<SCALEEra> {
        return this.decodeNextValue(SCALEEra.decode)
    }

    public decodeNextHash(bitLength: number): SCALEDecodeResult<SCALEHash> {
        return this.decodeNextValue(hex => SCALEHash.decode(hex, bitLength))
    }

    public decodeNextInt(bitLength: number): SCALEDecodeResult<SCALEInt> {
        return this.decodeNextValue(hex => SCALEInt.decode(hex, bitLength))
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

    public decodeNextObject<T>(decoderMethod: DecoderMethod<T>): SCALEDecodeResult<T> {
        return this.decodeNextValue(decoderMethod)
    }

    private decodeNextValue<T>(decoderMethod: DecoderMethod<T>, nibbleLength?: number): SCALEDecodeResult<T> {
        const decoded = decoderMethod(this.hex.substr(0, nibbleLength))
        this.moveCursor(decoded.bytesDecoded)
        return decoded
    }

    private moveCursor(bytes: number) {
        this.hex = this.hex.slice(bytes * 2)
    }
}