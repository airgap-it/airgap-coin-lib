import { AirGapTransaction } from '@airgap/module-kit'

import { SubstrateProtocolConfiguration } from '../../../types/configuration'
import { SCALEDecoder, SCALEDecodeResult } from '../../scale/SCALEDecoder'
import { SCALEClass } from '../../scale/type/SCALEClass'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { SCALEType } from '../../scale/type/SCALEType'
import { SubstrateTransactionType } from '../SubstrateTransaction'

import { TransactionMethodArgsDecoder, TransactionMethodArgsFactory } from './SubstrateTransactionMethodArgs'

export class SubstrateTransactionMethod extends SCALEClass {
  public static create<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    type: SubstrateTransactionType<C>,
    moduleIndex: number,
    callIndex: number,
    args: any
  ): SubstrateTransactionMethod {
    const argsFactory = TransactionMethodArgsFactory.create(configuration, type, args)

    return new SubstrateTransactionMethod(
      SCALEInt.from(moduleIndex),
      SCALEInt.from(callIndex),
      argsFactory.createFields(),
      argsFactory.createToAirGapTransactionParts()
    )
  }

  public static decode<C extends SubstrateProtocolConfiguration>(
    configuration: C,
    runtimeVersion: number | undefined,
    type: SubstrateTransactionType<C>,
    raw: string
  ): SCALEDecodeResult<SubstrateTransactionMethod> {
    const decoder = new SCALEDecoder(configuration, runtimeVersion, raw)

    const moduleIndex = decoder.decodeNextInt(8)
    const callIndex = decoder.decodeNextInt(8)

    const argsDecoder = TransactionMethodArgsDecoder.create(configuration, type)
    const args = decoder.decodeNextObject((configuration, runtimeVersion, hex) => argsDecoder.decode(configuration, runtimeVersion, hex))

    return {
      bytesDecoded: moduleIndex.bytesDecoded + callIndex.bytesDecoded + args.bytesDecoded,
      decoded: SubstrateTransactionMethod.create(
        configuration,
        type,
        moduleIndex.decoded.toNumber(),
        callIndex.decoded.toNumber(),
        args.decoded
      )
    }
  }

  protected readonly scaleFields = [this.moduleIndex, this.callIndex, ...this.args.map((arg) => arg[1])]

  private constructor(
    readonly moduleIndex: SCALEInt,
    readonly callIndex: SCALEInt,
    readonly args: [string, SCALEType][],
    readonly toAirGapTransactionParts: () => Partial<AirGapTransaction>[]
  ) {
    super()
  }

  public toString(): string {
    return JSON.stringify(
      {
        moduleIndex: this.moduleIndex.toNumber(),
        callIndex: this.callIndex.toNumber(),
        ...this.args.reduce((prev, [key, value]) => {
          let valueString = value.toString()
          try {
            valueString = JSON.parse(valueString)
          } catch {}

          return Object.assign(prev, {
            [key]: valueString
          })
        }, {})
      },
      null,
      2
    )
  }
}
