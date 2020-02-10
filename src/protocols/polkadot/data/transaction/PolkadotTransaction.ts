import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { PolkadotSignature, PolkadotSignatureParams } from "./PolkadotSignature"
import { UnsignedTransaction } from "../../../../serializer/schemas/definitions/transaction-sign-request"
import { SignedTransaction } from "../../../../serializer/schemas/definitions/transaction-sign-response"
import { IAirGapTransaction } from "../../../../interfaces/IAirGapTransaction"
import { encodeAddress } from "../../utils/address"
import { SCALECompactInt, SCALEEra, SCALEAddress, SCALEType, SCALEByteArray } from "../../type/scaleType"
import { SCALEClass } from "../../type/scaleClass"

const VERSION = 4
const BIT_SIGNED = 128
const BIT_UNSIGNED = 0

interface PolkadotTransactionConfig {
    from: string,
    args: any,
    tip: number | BigNumber,
    methodId: { moduleIndex: number, callIndex: number }
}

export enum PolkadotTransactionType {
    SPEND, DELEGATION
}

export class PolkadotTransaction extends SCALEClass {
    public static create(type: PolkadotTransactionType, config: PolkadotTransactionConfig): PolkadotTransaction {
        return new PolkadotTransaction(
            SCALEAddress.from(config.from), 
            PolkadotSignature.createSr25519(config.from), 
            SCALECompactInt.from(config.tip), 
            PolkadotTransactionMethod.create(type, config.methodId.moduleIndex, config.methodId.callIndex, config.args)
        )
    }

    private era: SCALEEra = SCALEEra.Immortal()
    private nonce: SCALECompactInt = SCALECompactInt.from(0)

    protected get scaleFields(): SCALEType[] {
        return [this.signer, this.signature, this.era, this.nonce, this.tip, this.method]
    }

    private constructor(
        readonly signer: SCALEAddress,
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
            from: [encodeAddress(this.signer.accountId)],
            to: [],
            isInbound: false,
            amount: '',
            fee: this.tip.value.toString(10),
            protocolIdentifier: identifier,
            ...this.method.toAirGapTransactionPart()
        }
    }
}

export interface UnsignedPolkadotTransaction extends UnsignedTransaction {
    transaction: PolkadotTransaction
}

export interface SignedPolkadotTransaction extends SignedTransaction {

}