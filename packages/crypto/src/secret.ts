import { assertNever } from '@airgap/coinlib-core'
// @ts-ignore
import { mnemonicToSeed as bip39MnemonicToSeed } from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0'
import { CryptoConfiguration, CryptoSecretType } from '@airgap/module-kit'
import { bip39ToMiniSecret, waitReady } from '@polkadot/wasm-crypto'

export async function mnemonicToSeed(crypto: CryptoConfiguration, mnemonic: string, password?: string): Promise<Buffer> {
  const seed: Buffer | undefined =
    crypto.algorithm !== 'sr25519'
      ? mnemonicToBip39Seed(crypto.secretType ?? 'secret', mnemonic, password)
      : crypto.compatibility === 'substrate'
      ? await mnemonicToSubstrateSeed(mnemonic, password)
      : undefined

  if (seed === undefined) {
    throw new Error('Invalid crypto configuration')
  }

  return seed
}

async function mnemonicToSubstrateSeed(mnemonic: string, password?: string): Promise<Buffer> {
  await waitReady()
  const secret: Uint8Array = bip39ToMiniSecret(mnemonic, password || '')

  return Buffer.from(secret)
}

function mnemonicToBip39Seed(secretType: CryptoSecretType, mnemonic: string, password?: string): Buffer {
  const seed: Buffer = bip39MnemonicToSeed(mnemonic, password)

  switch (secretType) {
    case 'secret':
      return seed
    case 'miniSecretXor':
      const first32: Buffer = seed.slice(0, 32)
      const second32: Buffer = seed.slice(32)

      // tslint:disable-next-line: no-bitwise
      return Buffer.from(first32.map((byte: number, index: number) => byte ^ second32[index]))
    default:
      assertNever(secretType)
      throw new Error(`Secret type ${secretType} is not supported`)
  }
}
