import BigNumber from "../../../dependencies/src/bignumber.js-9.0.0/bignumber";
import { changeEndianness, addHexPrefix, isHex, stripHexPrefix } from "../../../utils/hex";
import { isString } from "util";
import { encodeAddress } from "../utils/address";

export interface SCALEEncodeConfig {
    withPrefix: boolean
}

export abstract class SCALEType {
    public encode(config?: SCALEEncodeConfig): string {
        const encoded = this._encode()
        return (config && config.withPrefix) ? addHexPrefix(encoded) : encoded
    }

    protected abstract _encode(): string
}

export class SCALEInt extends SCALEType {
    public static from(value: number | BigNumber | string, bitLength?: number): SCALEInt {
        return new SCALEInt(BigNumber.isBigNumber(value) ? value : new BigNumber(value), bitLength)
    }

    private constructor(readonly value: BigNumber, readonly bitLength?: number) { super() }

    public asString(base: number = 10): string {
        return this.value.toString(base)
    }

    protected _encode(): string {
        const encoded = changeEndianness(this.value.toString(16))
        const encodedBytes = Math.ceil(encoded.length / 2)
        const byteLength = this.bitLength ? Math.ceil((this.bitLength) / 8) : encodedBytes

        const lengthDiff = byteLength - encodedBytes
        if (lengthDiff > 0) {
            return encoded + '00'.repeat(lengthDiff)
        } else {
            return encoded
        }
    }
}

export class SCALECompactInt extends SCALEType {
    public static from(value: number | BigNumber | string): SCALECompactInt {
        return new SCALECompactInt(BigNumber.isBigNumber(value) ? value : new BigNumber(value))
    }

    private constructor(readonly value: BigNumber) { super() }

    public asString(base: number = 10): string {
        return this.value.toString(base)
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
        const encodedValue = this.value.multipliedBy(4).plus(mode) // value >> 2 + mode

        return changeEndianness(encodedValue.toString(16))
    }
}

type SCALEMortalEraConfig = { chainHeight: number | BigNumber, period: number | BigNumber }
export class SCALEEra extends SCALEType {
    public static Immortal(): SCALEEra {
        return new SCALEEra(0, 0)
    }

    public static Mortal(config: SCALEMortalEraConfig): SCALEEra {
        const chainHeight = BigNumber.isBigNumber(config.chainHeight) ? config.chainHeight.toNumber() : config.chainHeight
        let period = BigNumber.isBigNumber(config.period) ? config.period.toNumber() : config.period

        period = Math.pow(2, Math.ceil(Math.log2(period)))
        period = Math.min(Math.max(period, 4), 1 << 16)

        const phase = chainHeight % period
        
        const quantizeFactor = Math.max(period >> 12, 1)
        const quantizePhase = phase / quantizeFactor * quantizeFactor

        return new SCALEEra(period, quantizePhase)
    }

    private constructor(readonly period: number, readonly phase: number) { super() }

    public get isMortal(): boolean {
        return this.period !== 0
    }

    protected _encode(): string {
        if (!this.isMortal) {
            return '00'
        }

        const quantizeFactor = Math.max(this.period >> 12, 1)
        const trailingZeros = this.getTrailingZeros(this.period)
        const encoded = Math.min(15, Math.max(1, trailingZeros - 1)) + (((this.phase / quantizeFactor) << 4))
        const first = encoded >> 8
        const second = encoded & 0xff

        return Buffer.from([second, first]).toString('hex')
    }

    private getTrailingZeros(value: number): number {
        return value.toString(2).split('').reverse().join('').indexOf('1')
    }
}

export class SCALEAccountId extends SCALEType {
    public static from(publicKey: string): SCALEAccountId {
        return new SCALEAccountId(publicKey)
    }

    private constructor(readonly value: string) { super() }

    public asAddress(): string {
        return encodeAddress(this.value)
    }

    protected _encode(): string {
        return this.value
    }
}

export class SCALEAddress extends SCALEType {
    public static from(publicKey: string): SCALEAddress {
        return new SCALEAddress(publicKey)
    }

    private constructor(readonly accountId: string) { super() }

    public asAddress(): string {
        return encodeAddress(this.accountId)
    }

    protected _encode(): string {
        return 'ff' + this.accountId
    }
}

export class SCALEBytes extends SCALEType {
    public static empty(): SCALEBytes {
        return new SCALEBytes(Buffer.from([]))
    }
    
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

    public get isEmpty(): boolean {
        return this.value.length === 0
    }

    private constructor(readonly value: Buffer) { super() }

    protected _encode(): string {
        return this.value.toString('hex')
    }
}

export class SCALEByteArray extends SCALEType {
    public static from(bytes: string | Buffer | Uint8Array): SCALEByteArray {
        let buffer: Buffer
        if (isString(bytes) && isHex(bytes)) {
            buffer = Buffer.from(stripHexPrefix(bytes), 'hex')
        } else if (!isString(bytes)) {
            buffer = Buffer.from(bytes)
        } else {
            throw new Error('Unknown byte array type.')
        }

        return new SCALEByteArray(buffer)
    }

    private constructor(readonly bytes: Buffer) { super() }

    protected _encode(): string {
        return SCALECompactInt.from(this.bytes.length).encode() + this.bytes.toString('hex')
    }
}