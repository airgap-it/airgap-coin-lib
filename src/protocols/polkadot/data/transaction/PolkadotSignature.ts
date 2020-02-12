import { PolkadotTransactionMethod } from "./PolkadotTransactionMethod";
import BigNumber from "../../../../dependencies/src/bignumber.js-9.0.0/bignumber";
import { PolkadotTransactionPayload } from "./PolkadotTransactionPayload";
import { sr25519Sign, waitReady } from "@polkadot/wasm-crypto";
import { stripHexPrefix } from "../../../../utils/hex";
import { blake2bAsBytes } from "../../../../utils/blake2b";
import { SCALEClass } from "../../type/SCALEClass";
import { SCALEAddress } from "../../type/primitive/SCALEAddress";
import { SCALEHash } from "../../type/primitive/SCALEHash";
import { SCALEType } from "../../type/SCALEType";
import { SCALEInt } from "../../type/primitive/SCALEInt";
import { SCALEEra } from "../../type/primitive/SCALEEra";

enum PolkadotSignatureType {
    Ed25519 = 0,
    Sr25519,
    Ecdsa
}

export class PolkadotSignature extends SCALEClass {
    public static createSr25519(signer: string): PolkadotSignature {
        return new PolkadotSignature(PolkadotSignatureType.Sr25519, SCALEAddress.from(signer))
    }

    signature: SCALEHash = SCALEHash.empty()

    protected get scaleFields(): SCALEType[] {
        return [SCALEInt.from(this.type), this.signature]
    }

    public get isSigned(): boolean {
        return !this.signature.isEmpty
    }

    constructor(
        readonly type: PolkadotSignatureType,
        readonly signer: SCALEAddress
    ) { super() }

    public async sign(privateKey: Buffer, method: PolkadotTransactionMethod, signatureParams: PolkadotSignatureParams): Promise<void> {
        const payload = PolkadotTransactionPayload.create(
            method, 
            signatureParams.era, 
            signatureParams.nonce, 
            signatureParams.tip, 
            signatureParams.specVersion, 
            signatureParams.genesisHash, 
            signatureParams.blockHash
        )
        this.signature = SCALEHash.from(await this.signPayload(privateKey, payload))
    }

    private async signPayload(privateKey: Buffer, payload: PolkadotTransactionPayload): Promise<Uint8Array> {
        await waitReady()
        
        const publicKey = Buffer.from(stripHexPrefix(this.signer.accountId), 'hex')
        const payloadBuffer = Buffer.from(payload.encode(), 'hex')
        const message = payloadBuffer.length > 256 ? blake2bAsBytes(payloadBuffer, 256) : payloadBuffer

        return sr25519Sign(publicKey, privateKey, message)
    }
}

export interface PolkadotSignatureParams {
    blockHash: string,
    era: SCALEEra,
    genesisHash: string,
    nonce: number | BigNumber,
    specVersion: number | BigNumber,
    tip: number | BigNumber
}