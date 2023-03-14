export interface DerivationIndex {
  value: number
  masked: number
  isHardened: boolean
}

export interface DerivationKey {
  depth: number
  parentFingerprint: number
  index: number
  chainCode: Buffer
  key: Buffer
}

export interface DerivationNode {
  depth: number
  parentFingerprint: number
  index: number
  chainCode: Buffer
  secretKey: Buffer
  publicKey: Buffer
}

export type DerivationKeyType = Extract<keyof DerivationNode, 'secretKey' | 'publicKey'>
