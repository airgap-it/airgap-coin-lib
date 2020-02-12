import { SCALEType } from "../SCALEType"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { changeEndianness } from "../../../../utils/hex"
import { SCALEDecodeResult } from "../SCALEDecoder"

export class SCALECompactInt extends SCALEType {
    public static from(value: number | BigNumber | string): SCALECompactInt {
        return new SCALECompactInt(BigNumber.isBigNumber(value) ? value : new BigNumber(value))
    }

    public static decode(hex: string): SCALEDecodeResult<SCALECompactInt> {
        const firstByte = parseInt(hex.substr(0, 2), 16)
        const mode = parseInt(firstByte.toString(2).slice(-2), 2)

        let bytes: number
        if (mode === 3) {
            bytes = parseInt(firstByte.toString(2).substr(0, 6), 2)
        } else {
            bytes = 1 << mode
        }
        
        const encodedHex = hex.substr(0, bytes * 2)
        const encodedBin = new BigNumber(changeEndianness(encodedHex), 16).toString(2)

        return {
            bytesDecoded: bytes,
            decoded: SCALECompactInt.from(new BigNumber(encodedBin.slice(0, -2), 2))
        }
    }

    private constructor(readonly value: BigNumber) { super() }

    public asString(base: number = 10): string {
        return this.value.toString(base)
    }

    public asNumber(): number {
        return this.value.toNumber()
    }

    protected _encode(): string {
        const bits = this.value.toString(2).length
        let mode: number
        if (bits <= 6) {
            // 0b00: single-byte mode, upper six bits are the LE encoding of the value (valid only for values of 0-63)
            mode = 0
        } else if (bits <= 14) {
            // 0b01: two-byte mode: upper six bits and the following byte is the LE encoding of the value (valid only for values 64-(2**14-1))
            mode = 1
        } else if (bits <= 30) {
            // 0b10: four-byte mode: upper six bits and the following three bytes are the LE encoding of the value (valid only for values (2**14)-(2**30-1))
            mode = 2
        } else {
            // 0b11: Big-integer mode: The upper six bits are the number of bytes following, less four. The value is contained, LE encoded, in the bytes following. The final (most significant) byte must be non-zero. Valid only for values (2**30)-(2**536-1)
            mode = 3
        }
        
        let value: BigNumber
        if (mode == 3) {
            const bytes = Math.ceil(bits / 8)
            value = this.value.multipliedBy(64).plus(bytes - 4) // value << 6 + number of bytes
        } else {
            value = this.value
        }
            
        const encodedValue = value.multipliedBy(4).plus(mode) // value << 2 + mode

        return changeEndianness(encodedValue.toString(16))
    }
}