import { Sealed } from './base/sealed'

export type SecretType = 'mnemonic' | 'hex'

interface BaseSecret<_Type extends SecretType> extends Sealed<_Type> {
  value: string
}

export interface MnemonicSecret extends BaseSecret<'mnemonic'> {}
export interface HexSecret extends BaseSecret<'hex'> {}

export type Secret = MnemonicSecret | HexSecret
