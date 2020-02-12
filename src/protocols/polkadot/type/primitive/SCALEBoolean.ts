import { SCALEType } from "../SCALEType";
import { toHexStringRaw } from "../../../../utils/hex";
import { SCALEDecodeResult } from "../SCALEDecoder";

export class SCALEBoolean extends SCALEType {
    public static from(value: boolean | number): SCALEBoolean {
        return new SCALEBoolean(!!value)
    }

    public static decode(hex: string): SCALEDecodeResult<SCALEBoolean> {
        const value = parseInt(hex.substr(0, 2), 16)
        return {
            bytesDecoded: 1,
            decoded: SCALEBoolean.from(value)
        }
    }

    private constructor(readonly value: boolean) { super() }

    protected _encode(): string {
        return toHexStringRaw(this.value ? 1 : 0)
    }
}