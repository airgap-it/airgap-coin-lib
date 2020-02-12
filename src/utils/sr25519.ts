import { waitReady, sr25519KeypairFromSeed, sr25519DeriveKeypairHard, sr25519DeriveKeypairSoft } from '@polkadot/wasm-crypto'

import { KeyPair } from "../data/KeyPair";
import { stripHexPrefix, toHexStringRaw, changeEndianness } from './hex';

interface DeriveJunction {
    chainCode: Uint8Array,
    isHard: boolean
}

function assertProperDerivationPath(path: string) {
    if (!(['m', 'm/'] as any).includes(path.slice(0, 2))) {
        throw new Error('Invalid derivation path')
    }
}

function getChainCode(value: string): Uint8Array {
    const chainCode = new Uint8Array(32)
    const index = parseInt(value, 10)
    const indexHex = changeEndianness(toHexStringRaw(index))

    chainCode.fill(0)
    chainCode.set(Buffer.from(indexHex, 'hex'))

    return chainCode
}

function createDeriveJunction(value: string): DeriveJunction {
    const isHard = (['h', `'`] as any).includes(value.slice(-1))
    const code = isHard ? value.slice(0, -1) : value
    return {
        chainCode: getChainCode(code),
        isHard
    }
}

function deriveFromPath(keyPair: Uint8Array, path: string): Buffer {
    const deriveJunctions = path.split('/').map(value => createDeriveJunction(value))
    const derived = deriveJunctions.reduce((pair, junction) => {
        const deriveKeypair = junction.isHard ? sr25519DeriveKeypairHard : sr25519DeriveKeypairSoft
        return deriveKeypair(pair, junction.chainCode)
    }, keyPair)

    return Buffer.from(derived)
}

export async function createSr25519KeyPair(secret: string, derivationPath: string): Promise<KeyPair> {
    assertProperDerivationPath(derivationPath)
    await waitReady()

    const keyPair = sr25519KeypairFromSeed(Buffer.from(stripHexPrefix(secret), 'hex').subarray(0, 32)) // 32-bit seed is required
    const derivedKeyPair = deriveFromPath(keyPair, derivationPath.slice(2))

    return {
        privateKey: derivedKeyPair.slice(0, 64),
        publicKey: derivedKeyPair.slice(64)
    }
}