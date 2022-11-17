import { Sealed } from './base/sealed'

export type KeyType = 'priv' | 'xpriv' | 'pub' | 'xpub'
export type KeyFormat = 'hex' | 'encoded'

interface BaseKey<_Type extends KeyType> extends Sealed<_Type> {
  format: KeyFormat
  value: string
}

export interface PrivateKey extends BaseKey<'priv'> {}
export interface ExtendedPrivateKey extends BaseKey<'xpriv'> {}

export interface PublicKey extends BaseKey<'pub'> {}
export interface ExtendedPublicKey extends BaseKey<'xpub'> {}

interface BaseKeyPair<_PrivateKey extends PrivateKey | ExtendedPrivateKey, _PublicKey extends PublicKey | ExtendedPublicKey> {
  privateKey: _PrivateKey
  publicKey: _PublicKey
}

export type KeyPair = BaseKeyPair<PrivateKey, PublicKey>
export type ExtendedKeyPair = BaseKeyPair<ExtendedPrivateKey, ExtendedPublicKey>
