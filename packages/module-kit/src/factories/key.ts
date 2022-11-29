import { ExtendedPublicKey, ExtendedSecretKey, PublicKey, SecretKey } from '../types/key'

export function newSecretKey(value: string, format: SecretKey['format'] = 'encoded'): SecretKey {
  return { type: 'priv', value, format }
}

export function newExtendedSecretKey(value: string, format: ExtendedSecretKey['format'] = 'encoded'): ExtendedSecretKey {
  return { type: 'xpriv', value, format }
}

export function newPublicKey(value: string, format: PublicKey['format'] = 'encoded'): PublicKey {
  return { type: 'pub', value, format }
}

export function newExtendedPublicKey(value: string, format: ExtendedPublicKey['format'] = 'encoded'): ExtendedPublicKey {
  return { type: 'xpub', value, format }
}
