import xxhash = require('xxhashjs')
import { changeEndianness, addHexPrefix } from './hex'

export function xxhashAsHex(data: string, bitLength: number, config: { littleEndian: boolean, prefix: boolean } = { littleEndian: true, prefix: false }): string {
    const chunks = Math.ceil(bitLength / 64)
    
    let hex = ''
    for (let seed = 0; seed < chunks; seed++) {
        const hash = xxhash.h64(data, seed).toString(16)
        hex += config.littleEndian ? changeEndianness(hash) : hash
    }
    return config.prefix ? addHexPrefix(hex) : hex
}