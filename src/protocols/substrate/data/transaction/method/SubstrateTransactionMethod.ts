import { SCALEClass } from '../../scale/type/SCALEClass'
import { SCALEType } from '../../scale/type/SCALEType'
import { SCALEInt } from '../../scale/type/SCALEInt'
import { SCALEDecodeResult, SCALEDecoder } from '../../scale/SCALEDecoder'
import { SubstrateTransactionType } from '../SubstrateTransaction'
import { SubstrateTransactionMethodArgsFactory, SubstrateTransactionMethodArgsDecoder } from './SubstrateTransactionMethodArgs'
import { IAirGapTransaction } from '../../../../..'

export class SubstrateTransactionMethod extends SCALEClass {
    public static create(type: SubstrateTransactionType, moduleIndex: number, callIndex: number, args: any): SubstrateTransactionMethod {
        const argsFactory = SubstrateTransactionMethodArgsFactory.create(type, args)

        return new SubstrateTransactionMethod(
            SCALEInt.from(moduleIndex),
            SCALEInt.from(callIndex),
            argsFactory.createFields(),
            argsFactory.createToAirGapTransactionParts()
        )
    }

    public static decode(type: SubstrateTransactionType, raw: string): SCALEDecodeResult<SubstrateTransactionMethod> {
        const decoder = new SCALEDecoder(raw)

        const moduleIndex = decoder.decodeNextInt(8)
        const callIndex = decoder.decodeNextInt(8)

        const argsDecoder = SubstrateTransactionMethodArgsDecoder.create(type)
        const args = decoder.decodeNextObject(hex => argsDecoder.decode(hex))

        return {
            bytesDecoded: moduleIndex.bytesDecoded + callIndex.bytesDecoded + args.bytesDecoded,
            decoded: SubstrateTransactionMethod.create(type, moduleIndex.decoded.toNumber(), callIndex.decoded.toNumber(), args.decoded)
        }
    }

    protected readonly scaleFields = [this.moduleIndex, this.callIndex, ...this.args.map(arg => arg[1])]

    private constructor(
        readonly moduleIndex: SCALEInt,
        readonly callIndex: SCALEInt,
        readonly args: [string, SCALEType][],
        readonly toAirGapTransactionParts: () => Partial<IAirGapTransaction>[]
    ) { super() }

    public toString(): string {
        return JSON.stringify({
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
        }, null, 2)
    }
}