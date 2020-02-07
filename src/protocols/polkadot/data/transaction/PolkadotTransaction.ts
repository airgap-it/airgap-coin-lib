import { PolkadotTransactionMethod, PolkadotSpendTransactionMethod } from "./PolkadotTransactionMethod"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { PolkadotSignature, PolkadotSignatureParams, PolkadotSignatureType } from "./PolkadotSignature"
import { UnsignedTransaction } from "../../../../serializer/schemas/definitions/transaction-sign-request"
import { SignedTransaction } from "../../../../serializer/schemas/definitions/transaction-sign-response"
import { IAirGapTransaction } from "../../../../interfaces/IAirGapTransaction"
import { encodeAddress } from "../../utils/address"
import { SCALECompactInt, SCALEEra, SCALEAccountId, SCALEType, SCALEByteArray, SCALEInt } from "../../type/scaleType"
import { SCALEClass } from "../../type/scaleClass"

const VERSION = 4
const BIT_SIGNED = 128
const BIT_UNSIGNED = 0

interface PolkadotTransactionConfig {
    from: string,
    tip: number | BigNumber,
    methodId: { moduleIndex: number, callIndex: number }
}

export interface PolkadotSpendTransactionConfig extends PolkadotTransactionConfig {
    to: string,
    value: number | BigNumber
}

export class PolkadotTransaction extends SCALEClass {
    private era: SCALEEra = SCALEEra.Immortal()
    private nonce: SCALECompactInt = SCALECompactInt.from(0)

    protected get scaleFields(): SCALEType[] {
        return [this.signer, this.signature, this.era, this.nonce, this.tip, this.method]
    }

    private constructor(
        readonly signer: SCALEAccountId,
        readonly signature: PolkadotSignature,
        readonly tip: SCALECompactInt,
        readonly method: PolkadotTransactionMethod,
    ) { super() }

    protected _encode(): string {
        const typeEncoded = Buffer.from([VERSION | (this.signature.isSigned ? BIT_SIGNED : BIT_UNSIGNED)]).toString('hex')
        return SCALEByteArray.from(
            typeEncoded + this.scaleFields.reduce((encoded: string, struct: SCALEType) => encoded + struct.encode(), '')
        ).encode()
    }

    public async sign(privateKey: Buffer, signatureParams: Partial<PolkadotSignatureParams>): Promise<void> {
        this.era = signatureParams.era || SCALEEra.Immortal()
        this.nonce = SCALECompactInt.from(signatureParams.nonce || 0)

        await this.signature.sign(privateKey, this.method, {
            tip: this.tip.value, ...signatureParams 
        } as PolkadotSignatureParams)
    }

    public toAirGapTransaction(identifier: string): IAirGapTransaction {
        return {
            from: [encodeAddress(this.signer.value)],
            to: [],
            isInbound: false,
            amount: '',
            fee: this.tip.value.toString(10),
            protocolIdentifier: identifier,
            ...this.method.toAirGapTransactionPart()
        }
    }

    static Factory = class {
        private constructor() {}

        public static create(config: PolkadotTransactionConfig): PolkadotTransaction {
            const createSpend = (config: PolkadotTransactionConfig): config is PolkadotTransactionConfig => {
                const spendConfig = config as PolkadotSpendTransactionConfig
                return spendConfig.to !== undefined && spendConfig.value !== undefined
            }

            let method: PolkadotTransactionMethod
            if (createSpend(config)){
                const spendConfig = config as PolkadotSpendTransactionConfig
                method = new PolkadotSpendTransactionMethod(
                    SCALEInt.from(spendConfig.methodId.moduleIndex), 
                    SCALEInt.from(spendConfig.methodId.callIndex), 
                    SCALEAccountId.from(spendConfig.to), 
                    SCALECompactInt.from(spendConfig.value)
                )
            } else {
                throw new Error('Unknown Polkadot transaction config type.')
            }
            const signature = new PolkadotSignature(
                PolkadotSignatureType.Sr25519, 
                SCALEAccountId.from(config.from)
            )
    
            return new PolkadotTransaction(
                SCALEAccountId.from(config.from), 
                signature, 
                SCALECompactInt.from(config.tip), 
                method
            )
        }
    }
}

export interface UnsignedPolkadotTransaction extends UnsignedTransaction {
    transaction: PolkadotTransaction
}

export interface SignedPolkadotTransaction extends SignedTransaction {

}