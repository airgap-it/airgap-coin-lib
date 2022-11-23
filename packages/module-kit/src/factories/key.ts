import { ExtendedSecretKey, ExtendedPublicKey, SecretKey, PublicKey } from '../types/key'

export function secretKey(value: string, format: SecretKey['format'] = 'encoded'): SecretKey {
  return { type: 'priv', value, format }
}

export function extendedSecretKey(value: string, format: ExtendedSecretKey['format'] = 'encoded'): ExtendedSecretKey {
  return { type: 'xpriv', value, format }
}

export function publicKey(value: string, format: PublicKey['format'] = 'encoded'): PublicKey {
  return { type: 'pub', value, format }
}

export function extendedPublicKey(value: string, format: ExtendedPublicKey['format'] = 'encoded'): ExtendedPublicKey {
  return { type: 'xpub', value, format }
}
