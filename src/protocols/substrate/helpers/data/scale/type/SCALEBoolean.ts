import { SCALEType } from './SCALEType'
import { SCALEDecodeResult } from '../SCALEDecoder'
import { stripHexPrefix, toHexStringRaw } from '../../../../../../utils/hex'

export class SCALEBoolean extends SCALEType {
    public static from(value: boolean | number): SCALEBoolean {
        return new SCALEBoolean(!!value)
    }

    public static decode(hex: string): SCALEDecodeResult<SCALEBoolean> {
        const _hex = stripHexPrefix(hex)
        
        const value = parseInt(_hex.substr(0, 2), 16)
        return {
            bytesDecoded: 1,
            decoded: SCALEBoolean.from(value)
        }
    }

    private constructor(readonly value: boolean) { super() }

    public toString(): string {
        return String(this.value)
    }

    protected _encode(): string {
        return toHexStringRaw(this.value ? 1 : 0)
    }
}