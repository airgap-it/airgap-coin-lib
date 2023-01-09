// @ts-ignore
import { mnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0'

export function getSeedFromMnemonic(mnemonic: string, password?: string): Buffer {
  const seed: Buffer = mnemonicToSeed(mnemonic, password)

  // We xor the two halves of the BIP-39 seed, as does `tezos-client`
  const first32: Buffer = seed.slice(0, 32)
  const second32: Buffer = seed.slice(32)

  return Buffer.from(first32.map((byte, index) => byte ^ second32[index]))
}
