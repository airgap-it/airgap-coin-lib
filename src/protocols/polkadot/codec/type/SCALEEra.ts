import { SCALEType } from "../type/SCALEType"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"

const IMMORTAL_ENCODED = '00'
const ERA_DEFAULT_PERIOD = 50 // 5 min at 6s block times

export interface EraConfig { 
    chainHeight: number | BigNumber, 
    period?: number | BigNumber
 }

export class SCALEEra extends SCALEType {
    public static Immortal(): SCALEEra {
        return new SCALEEra(0, 0)
    }

    public static Mortal(config: EraConfig): SCALEEra {
        const chainHeight = BigNumber.isBigNumber(config.chainHeight) ? config.chainHeight.toNumber() : config.chainHeight
        let period = BigNumber.isBigNumber(config.period) ? config.period.toNumber() : config.period

        period = Math.pow(2, Math.ceil(Math.log2(period || ERA_DEFAULT_PERIOD)))
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
            return IMMORTAL_ENCODED
        }

        const quantizeFactor = Math.max(this.period >> 12, 1)
        const trailingZeros = this.getTrailingZeros(this.period)
        const encoded = Math.min(15, Math.max(1, trailingZeros - 1)) + (((this.phase / quantizeFactor) << 4))

        // return changeEndianness(toHexStringRaw(encoded, 16))
        const first = encoded >> 8
        const second = encoded & 0xff

        return Buffer.from([second, first]).toString('hex')
    }

    private getTrailingZeros(value: number): number {
        return value.toString(2).split('').reverse().join('').indexOf('1')
    }
}