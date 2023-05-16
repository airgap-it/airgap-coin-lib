import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'

import { ProtocolUnitsMetadata } from './protocol'

export interface Amount<_Units extends string = string> {
  value: string
  unit: _Units | 'blockchain'
}

export class AmountEnhanced<_Units extends string = string> implements Amount<_Units> {
  public get value(): string {
    return this.bnValue.toString(10)
  }

  private readonly bnValue: BigNumber

  public constructor(value: number | string | BigNumber, public readonly unit: Amount<_Units>['unit']) {
    this.bnValue = new BigNumber(value)
  }

  public convert(unit: _Units, unitsMetadata: ProtocolUnitsMetadata<_Units>): AmountEnhanced<_Units> {
    const blockchainAmount: AmountEnhanced<_Units> = this.blockchain(unitsMetadata)
    const unitValue: BigNumber = blockchainAmount.bnValue.shiftedBy(-unitsMetadata[unit].decimals)

    return new AmountEnhanced<_Units>(unitValue, unit)
  }

  public blockchain(unitsMetadata: ProtocolUnitsMetadata<_Units>): AmountEnhanced<_Units> {
    if (this.unit === 'blockchain') {
      return new AmountEnhanced<_Units>(this.bnValue, this.unit)
    }

    const blockchainValue: BigNumber = this.bnValue.shiftedBy(unitsMetadata[this.unit].decimals)

    return new AmountEnhanced<_Units>(blockchainValue, 'blockchain')
  }

  // Different representations

  public toBigNumber(): BigNumber {
    return new BigNumber(this.value)
  }

  // Serialization

  public toJSON(): Amount<_Units> {
    return {
      value: this.value,
      unit: this.unit
    }
  }
}
