import { SCALEClass } from '../../node/codec/type/SCALEClass'
import { SCALEEnum } from '../../node/codec/type/SCALEEnum'
import { SCALEHash } from '../../node/codec/type/SCALEHash'
import { SCALEDecodeResult, SCALEDecoder } from '../../node/codec/SCALEDecoder'

const SIGNATURE_BITS = 64 * 8 // 64 bytes

export enum PolkadotSignatureType {
    Ed25519 = 0,
    Sr25519,
    Ecdsa
}

export class PolkadotSignature extends SCALEClass {
    public static create(type: PolkadotSignatureType, signature?: string | Uint8Array | Buffer): PolkadotSignature {
        return new PolkadotSignature(SCALEEnum.from(type), signature ? SCALEHash.from(signature) : SCALEHash.empty(SIGNATURE_BITS))
    }

    public static decode(raw: string): SCALEDecodeResult<PolkadotSignature> {
        const decoder = new SCALEDecoder(raw)

        const type = decoder.decodeNextEnum(value => PolkadotSignatureType[PolkadotSignatureType[value]])
        const signature = decoder.decodeNextHash(SIGNATURE_BITS)

        return {
            bytesDecoded: type.bytesDecoded + signature.bytesDecoded,
            decoded: new PolkadotSignature(type.decoded, signature.decoded)
        }
    }

    protected scaleFields = [this.type, this.signature]

    public get isSigned(): boolean {
        return !this.signature.isEmpty
    }

    private constructor(
        readonly type: SCALEEnum<PolkadotSignatureType>,
        readonly signature: SCALEHash
    ) { super() }

    public toString(): string {
        return JSON.stringify({
            type: PolkadotSignatureType[this.type.value],
            isSigned: this.isSigned,
            signature: this.signature.toString()
        }, null, 2)
    }
}