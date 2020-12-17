import BigNumber from '../../../../../../dependencies/src/bignumber.js-9.0.0/bignumber'
import { changeEndianness, stripHexPrefix, toHexStringRaw } from '../../../../../../utils/hex'
import { SCALEDecodeResult } from '../SCALEDecoder'

import { SCALEType } from './SCALEType'

const IMMORTAL_ENCODED = '00'
const ERA_DEFAULT_PERIOD = 50 // 5 min at 6s block times

export interface EraConfig {
  chainHeight: number | BigNumber
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
    const quantizePhase = (phase / quantizeFactor) * quantizeFactor

    return new SCALEEra(period, quantizePhase)
  }

  public get isMortal(): boolean {
    return this.period !== 0
  }

  public static decode(hex: string): SCALEDecodeResult<SCALEEra> {
    const _hex = stripHexPrefix(hex)

    return _hex.substr(0, 2) === IMMORTAL_ENCODED ? SCALEEra.decodeImmortal() : SCALEEra.decodeMortal(_hex)
  }

  private static decodeImmortal(): SCALEDecodeResult<SCALEEra> {
    return {
      bytesDecoded: 1,
      decoded: SCALEEra.Immortal()
    }
  }

  private static decodeMortal(hex: string): SCALEDecodeResult<SCALEEra> {
    const encoded = parseInt(changeEndianness(hex.substr(0, 4)), 16)

    const period = 2 << encoded % (1 << 4)
    const quantizeFactor = Math.max(period >> 12, 1)
    const phase = (encoded >> 4) * quantizeFactor

    if (period < 4 || period < phase) {
      throw new Error('SCALEEra#decodeMortal: Invalid mortal era')
    }

    return {
      bytesDecoded: 2,
      decoded: new SCALEEra(period, phase)
    }
  }

  private constructor(readonly period: number, readonly phase: number) {
    super()
  }

  public toString(): string {
    return JSON.stringify(
      {
        isMortal: this.isMortal,
        period: this.period,
        phase: this.phase
      },
      null,
      2
    )
  }

  protected _encode(): string {
    if (!this.isMortal) {
      return IMMORTAL_ENCODED
    }

    const quantizeFactor = Math.max(this.period >> 12, 1)
    const trailingZeros = this.getTrailingZeros(this.period)
    const encoded = Math.min(15, Math.max(1, trailingZeros - 1)) + ((this.phase / quantizeFactor) << 4)

    return changeEndianness(toHexStringRaw(encoded, 16))
  }

  private getTrailingZeros(value: number): number {
    return value.toString(2).split('').reverse().join('').indexOf('1')
  }
}
