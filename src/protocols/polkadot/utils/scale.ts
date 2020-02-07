import BigNumber from "../../../dependencies/src/bignumber.js-9.0.0/bignumber";
import { isNumber } from "util";
import { changeEndianness } from "../../../utils/hex";

export function encodeIntToHex(value: number | BigNumber, bitLength?: number): string {
    if (!isNumber(value)) {
        return encodeIntToHex(value.toNumber(), bitLength)
    }

    const encoded = changeEndianness(value.toString(16))
    const encodedBytes = Math.ceil(encoded.length / 2)
    const byteLength = bitLength ? Math.ceil((bitLength) / 8) : encodedBytes

    const lengthDiff = (2 * byteLength) - encodedBytes
    if (lengthDiff > 0) {
        return encoded + '00'.repeat(lengthDiff)
    } else {
        return encoded
    }
}

export function encodeIntToU8a(value: number | BigNumber, bitLength?: number): Uint8Array {
    return Buffer.from(encodeIntToHex(value, bitLength), 'hex')
}

export function encodeCompactIntToHex(value: number | BigNumber): string {
    if (!BigNumber.isBigNumber(value)) {
        return encodeCompactIntToHex(new BigNumber(value))
    }

    const bits = value.toString(2).length
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
    const encodedValue = value.multipliedBy(4).plus(mode) // value >> 2 + mode
    return changeEndianness(encodedValue.toString(16))
}

export function encodeCompactIntToU8a(value: number | BigNumber): Uint8Array {
    return Buffer.from(encodeCompactIntToHex(value), 'hex')
}