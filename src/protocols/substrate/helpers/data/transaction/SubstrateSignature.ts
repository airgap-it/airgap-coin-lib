import { SCALEClass } from '../scale/type/SCALEClass'
import { SCALEEnum } from '../scale/type/SCALEEnum'
import { SCALEHash } from '../scale/type/SCALEHash'
import { SCALEDecodeResult, SCALEDecoder } from '../scale/SCALEDecoder'
import { SubstrateNetwork } from '../../../SubstrateNetwork'

const SIGNATURE_BITS = 64 * 8 // 64 bytes

export enum SubstrateSignatureType {
    Ed25519 = 0,
    Sr25519,
    Ecdsa
}

export class SubstrateSignature extends SCALEClass {
    public static create(type: SubstrateSignatureType, signature?: string | Uint8Array | Buffer): SubstrateSignature {
        return new SubstrateSignature(SCALEEnum.from(type), signature ? SCALEHash.from(signature) : SCALEHash.empty(SIGNATURE_BITS))
    }

    public static decode(network: SubstrateNetwork, raw: string): SCALEDecodeResult<SubstrateSignature> {
        const decoder = new SCALEDecoder(network, raw)

        const type = decoder.decodeNextEnum(value => SubstrateSignatureType[SubstrateSignatureType[value]])
        const signature = decoder.decodeNextHash(SIGNATURE_BITS)

        return {
            bytesDecoded: type.bytesDecoded + signature.bytesDecoded,
            decoded: new SubstrateSignature(type.decoded, signature.decoded)
        }
    }

    protected scaleFields = [this.type, this.signature]

    public get isSigned(): boolean {
        return !this.signature.isEmpty
    }

    private constructor(
        readonly type: SCALEEnum<SubstrateSignatureType>,
        readonly signature: SCALEHash
    ) { super() }

    public toString(): string {
        return JSON.stringify({
            type: SubstrateSignatureType[this.type.value],
            isSigned: this.isSigned,
            signature: this.signature.toString()
        }, null, 2)
    }
}