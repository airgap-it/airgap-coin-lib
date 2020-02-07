import { SCALEEncodable } from "./scale";
import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod";
import { PolkadotEra } from "./PolkadotEra";
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber";
import { PolkadotTransactionPayload } from "./PolkadotTransactionPayload";
import { sr25519Sign, waitReady } from "@polkadot/wasm-crypto";
import { stripHexPrefix, toHex } from "../../../../utils/hex";
import { blake2bAsBytes } from "../../../../utils/blake2b";

export class PolkadotSignature implements SCALEEncodable {
    private signature: Uint8Array | null = null

    constructor(
        private readonly type: PolkadotSignatureType,
        private readonly signer: string // public key
    ) {}

    public encode(): string {
        const typePrefix = toHex(this.type)
        const signatureHex = this.signature ? Buffer.from(this.signature).toString('hex') : ''
        
        return typePrefix + signatureHex
    }

    public async sign(privateKey: Buffer, method: PolkadotTransactionMethod, signatureParams: PolkadotSignatureParams): Promise<void> {
        const payload = this.createPayload(method, signatureParams)
        this.signature = await this.signPayload(privateKey, payload)
    }

    private createPayload(method: PolkadotTransactionMethod, signatureParams: PolkadotSignatureParams): PolkadotTransactionPayload {
        return new PolkadotTransactionPayload(
            method, 
            signatureParams.era, 
            signatureParams.nonce, 
            signatureParams.tip, 
            signatureParams.specVersion, 
            signatureParams.genesisHash, 
            signatureParams.blockHash
        )
    }

    private async signPayload(privateKey: Buffer, payload: PolkadotTransactionPayload): Promise<Uint8Array> {
        await waitReady()
        
        const publicKey = Buffer.from(stripHexPrefix(this.signer), 'hex')
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
    era: PolkadotEra,
    genesisHash: string,
    nonce: number | BigNumber,
    specVersion: number | BigNumber,
    tip: number | BigNumber
}