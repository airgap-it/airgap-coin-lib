import { ExtendedPrivateKey, ExtendedPublicKey, KeyFormat, PrivateKey, PublicKey } from '../types/key'

export function privateKey(value: string, format: KeyFormat = 'encoded'): PrivateKey {
  return { type: 'priv', value, format }
}

export function extendedPrivateKey(value: string, format: KeyFormat = 'encoded'): ExtendedPrivateKey {
  return { type: 'xpriv', value, format }
}

export function publicKey(value: string, format: KeyFormat = 'encoded'): PublicKey {
  return { type: 'pub', value, format }
}

export function extendedPublicKey(value: string, format: KeyFormat = 'encoded'): ExtendedPublicKey {
  return { type: 'xpub', value, format }
}
