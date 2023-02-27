export type CryptoAlgorithm = 'ed25519' | 'sr25519' | 'secp256k1' | /* | 'secp256r1' */ 'sapling'
export type CryptoSecretType = 'secret' | 'miniSecretXor'

interface BaseCryptoConfiguration<_Algorithm extends CryptoAlgorithm> {
  algorithm: _Algorithm
}

export interface Ed25519CryptoConfiguration<_SecretType extends CryptoSecretType = CryptoSecretType>
  extends BaseCryptoConfiguration<'ed25519'> {
  key?: string
  secretType?: _SecretType
}

export interface Sr25519CryptoConfiguration extends BaseCryptoConfiguration<'sr25519'> {
  compatibility: 'substrate'
}

export interface Secp256K1CryptoConfiguration<_SecretType extends CryptoSecretType = CryptoSecretType>
  extends BaseCryptoConfiguration<'secp256k1'> {
  key?: string
  secretType?: _SecretType
}

// export interface Secp256R1CryptoConfiguration<
//   _SecretType extends CryptoSecretType = CryptoSecretType
// > extends BaseCryptoConfiguration<'secp256r1'> {
//   secretType?: _SecretType
// }

export interface SaplingCryptoConfiguration<_SecretType extends CryptoSecretType = CryptoSecretType>
  extends BaseCryptoConfiguration<'sapling'> {
  secretType?: _SecretType
}

export type CryptoConfiguration =
  | Ed25519CryptoConfiguration
  | Sr25519CryptoConfiguration
  | Secp256K1CryptoConfiguration
  /* | Secp256R1CryptoConfiguration */
  | SaplingCryptoConfiguration

export interface CryptoDerivative {
  depth: number
  parentFingerprint: number
  index: number
  chainCode: string
  secretKey: string
  publicKey: string
}
