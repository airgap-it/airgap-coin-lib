import { ExtendedPublicKey, ExtendedSecretKey, PublicKey, SecretKey } from '../types/key'
import { implementsInterface } from './interface'

type AnyKey = SecretKey | ExtendedSecretKey | PublicKey | ExtendedPublicKey
export function isAnyKey(object: unknown): object is AnyKey {
  return (
    implementsInterface<AnyKey>(object, { type: 'required', format: 'required', value: 'required' }) &&
    (object.type === 'priv' || object.type === 'xpriv' || object.type === 'pub' || object.type === 'xpub')
  )
}

export function isSecretKey(object: unknown): object is SecretKey {
  return isAnyKey(object) && object.type === 'priv'
}

export function isExtendedSecretKey(object: unknown): object is ExtendedSecretKey {
  return isAnyKey(object) && object.type === 'xpriv'
}

export function isPublicKey(object: unknown): object is PublicKey {
  return isAnyKey(object) && object.type === 'pub'
}

export function isExtendedPublicKey(object: unknown): object is ExtendedPublicKey {
  return isAnyKey(object) && object.type === 'xpub'
}
