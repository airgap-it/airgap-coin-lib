import { SCALEClass } from "../codec/type/SCALEClass";
import { SCALEHash } from "../codec/type/SCALEHash";
import { SCALEType } from "../codec/type/SCALEType";
import { SCALEInt } from "../codec/type/SCALEInt";

export enum PolkadotSignatureType {
    Ed25519 = 0,
    Sr25519,
    Ecdsa
}

export class PolkadotSignature extends SCALEClass {
    public static create(type: PolkadotSignatureType, signature?: string | Uint8Array | Buffer): PolkadotSignature {
        return new PolkadotSignature(type, signature ? SCALEHash.from(signature) : SCALEHash.empty(64))
    }

    protected get scaleFields(): SCALEType[] {
        return [SCALEInt.from(this.type), this.signature]
    }

    public get isSigned(): boolean {
        return !this.signature.isEmpty
    }

    private constructor(
        readonly type: PolkadotSignatureType,
        readonly signature: SCALEHash
    ) { super() }
}