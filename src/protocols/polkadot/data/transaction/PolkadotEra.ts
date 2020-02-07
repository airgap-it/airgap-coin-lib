import { SCALEEncodable } from "./scale";
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber";

export abstract class PolkadotEra implements SCALEEncodable {
    public static create(config?: { period: number | BigNumber, chainHeight?: number | BigNumber }): PolkadotEra {
        if (config && config.period > 0 && config.chainHeight) {
            let period = BigNumber.isBigNumber(config.period) ? config.period.toNumber() : config.period
            period = Math.pow(2, Math.ceil(Math.log2(period)))
            period = Math.min(Math.max(period, 4), 1 << 16)

            const chainHeight = BigNumber.isBigNumber(config.chainHeight) ? config.chainHeight.toNumber() : config.chainHeight
            const phase = chainHeight % period
            
            const quantizeFactor = Math.max(period >> 12, 1)
            const quantizePhase = phase / quantizeFactor * quantizeFactor

            return new MortalEra(period, quantizePhase)
        }

        return new ImmortalEra()
    }
    public abstract encode(): string
}

export class ImmortalEra extends PolkadotEra {
    public encode(): string {
        return '00'
    }
}

export class MortalEra extends PolkadotEra {

    constructor(
        private readonly period: number,
        private readonly phase: number
    ) { super() }

    public encode(): string {
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