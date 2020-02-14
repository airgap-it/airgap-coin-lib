import { SCALEType } from "../type/SCALEType"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { stripHexPrefix, changeEndianness, toHexStringRaw } from "../../../../utils/hex"
import { SCALEDecodeResult } from "../SCALEDecoder"

export class SCALEInt extends SCALEType {
    public static from(value: number | BigNumber | string, bitLength?: number): SCALEInt {
        return new SCALEInt(BigNumber.isBigNumber(value) ? value : new BigNumber(value), bitLength)
    }

    public static decode(hex: string, bitLength?: number): SCALEDecodeResult<SCALEInt> {
        const nibbles = bitLength ? Math.ceil(bitLength / 4) : hex.length
        const _hex = changeEndianness(stripHexPrefix(hex).substr(0, nibbles))

        const decoded = new BigNumber(_hex, 16)
        return {
            bytesDecoded: Math.ceil(nibbles / 2),
            decoded: SCALEInt.from(decoded, bitLength)
        }
    }

    private constructor(
        private readonly value: BigNumber, 
        private readonly bitLength?: number
    ) { super() }

    public asString(base: number = 10): string {
        return this.value.toString(base)
    }

    public asNumber(): number {
        return this.value.toNumber()
    }

    protected _encode(): string {
        const hex = toHexStringRaw(this.value, this.bitLength)
        return changeEndianness(hex)
    }
}