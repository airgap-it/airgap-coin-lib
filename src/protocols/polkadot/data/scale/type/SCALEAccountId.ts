import { SCALEType } from "./SCALEType"
import { SCALEDecodeResult } from "../SCALEDecoder"
import { stripHexPrefix, bytesToHex } from "../../../../../utils/hex"
import { PolkadotAddress } from '../../account/PolkadotAddress'

export class SCALEAccountId extends SCALEType {
    public static from(value: string | Uint8Array | Buffer | PolkadotAddress): SCALEAccountId {
        const address: PolkadotAddress = value instanceof PolkadotAddress ? value : PolkadotAddress.from(bytesToHex(value))
        return new SCALEAccountId(address)
    }

    public static decode(hex: string): SCALEDecodeResult<SCALEAccountId> {
        const _hex = stripHexPrefix(hex)

        return {
            bytesDecoded: 32,
            decoded: SCALEAccountId.from(_hex.substr(0, 64))
        }
    }

    private constructor(readonly address: PolkadotAddress) { super() }

    public compare(other: SCALEAccountId): number {
        return this.address.compare(other.address)
    }

    public asAddress(): string {
        return this.address.toString()
    }

    public asBytes(): Buffer {
        return this.address.getBufferPublicKey()
    }

    public toString(): string {
        return this.address.getHexPublicKey()
    }

    protected _encode(): string {
        return this.address.getHexPublicKey()
    }
}