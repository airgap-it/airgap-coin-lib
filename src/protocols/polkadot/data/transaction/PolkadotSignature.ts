import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod";
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber";
import { PolkadotTransactionPayload } from "./PolkadotTransactionPayload";
import { sr25519Sign, waitReady } from "@polkadot/wasm-crypto";
import { stripHexPrefix } from "../../../../utils/hex";
import { blake2bAsBytes } from "../../../../utils/blake2b";
import { SCALEEra, SCALEAccountId, SCALECompactInt, SCALEInt, SCALEBytes, SCALEType } from "../../type/scaleType";
import { SCALEClass } from "../../type/scaleClass";

export class PolkadotSignature extends SCALEClass {
    signature: SCALEBytes = SCALEBytes.empty()

    protected get scaleFields(): SCALEType[] {
        return [SCALEInt.from(this.type), this.signature]
    }

    public get isSigned(): boolean {
        return !this.signature.isEmpty
    }

    constructor(
        readonly type: PolkadotSignatureType,
        readonly signer: SCALEAccountId
    ) { super() }

    public async sign(privateKey: Buffer, method: PolkadotTransactionMethod, signatureParams: PolkadotSignatureParams): Promise<void> {
        const payload = this.createPayload(method, signatureParams)
        this.signature = SCALEBytes.from(await this.signPayload(privateKey, payload))
    }

    private createPayload(method: PolkadotTransactionMethod, signatureParams: PolkadotSignatureParams): PolkadotTransactionPayload {
        return new PolkadotTransactionPayload(
            method, 
            signatureParams.era, 
            SCALECompactInt.from(signatureParams.nonce), 
            SCALECompactInt.from(signatureParams.tip), 
            SCALEInt.from(signatureParams.specVersion, 32), 
            SCALEBytes.from(signatureParams.genesisHash), 
            SCALEBytes.from(signatureParams.blockHash)
        )
    }

    private async signPayload(privateKey: Buffer, payload: PolkadotTransactionPayload): Promise<Uint8Array> {
        await waitReady()
        
        const publicKey = Buffer.from(stripHexPrefix(this.signer.value), 'hex')
        const payloadBuffer = Buffer.from(payload.encode(), 'hex')
        const message = payloadBuffer.length > 256 ? blake2bAsBytes(payloadBuffer, 256) : payloadBuffer

        return sr25519Sign(publicKey, privateKey, message)
    }
}

export enum PolkadotSignatureType {
    Ed25519 = 0,
    Sr25519,
    Ecdsa
}

export interface PolkadotSignatureParams {
    blockHash: string,
    era: SCALEEra,
    genesisHash: string,
    nonce: number | BigNumber,
    specVersion: number | BigNumber,
    tip: number | BigNumber
}