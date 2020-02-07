import { SCALEEncodable } from "./scale"
import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod"
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber"
import { encodeCompactIntToHex } from "../../utils/scale"
import { PolkadotEra } from "./PolkadotEra"
import { PolkadotSignature, PolkadotSignatureParams } from "./PolkadotSignature"
import { UnsignedTransaction } from "../../../../serializer/schemas/definitions/transaction-sign-request"
import { SignedTransaction } from "../../../../serializer/schemas/definitions/transaction-sign-response"
import { IAirGapTransaction } from "../../../../interfaces/IAirGapTransaction"
import { encodeAddress } from "../../utils/address"
import { addHexPrefix } from "../../../../utils/hex"

export class PolkadotTransaction implements SCALEEncodable {
    private era: PolkadotEra = PolkadotEra.create()
    private nonce: number | BigNumber = 0

    constructor(
        readonly signer: string, // public key
        private readonly signature: PolkadotSignature,
        private readonly tip: number | BigNumber,
        private readonly method: PolkadotTransactionMethod,
    ) {}

    public encode(): string {
        const signerEncoded = 'ff' + this.signer
        const signatureEncoded = this.signature.encode()
        const eraEncoded = this.era.encode()
        const nonceEncoded = encodeCompactIntToHex(this.nonce)
        const tipEncoded = encodeCompactIntToHex(this.tip)
        const methodEncoded = this.method.encode()

        const singleEncoded = '84' + signerEncoded + signatureEncoded + eraEncoded + nonceEncoded + tipEncoded + methodEncoded
        const lengthPrefix = encodeCompactIntToHex(Buffer.from(singleEncoded, 'hex').length)

        return addHexPrefix(lengthPrefix + singleEncoded)
    }

    public async sign(privateKey: Buffer, signatureParams: Partial<PolkadotSignatureParams>): Promise<void> {
        this.era = signatureParams.era || PolkadotEra.create()
        this.nonce = signatureParams.nonce || 0

        await this.signature.sign(privateKey, this.method, {
            tip: this.tip, ...signatureParams 
        } as PolkadotSignatureParams)
    }

    public toAirGapTransaction(identifier: string): IAirGapTransaction {
        return {
            from: [encodeAddress(this.signer)],
            to: [],
            isInbound: false,
            amount: '',
            fee: this.tip.toString(10),
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