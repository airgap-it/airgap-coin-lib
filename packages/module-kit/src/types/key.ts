import { Sealed } from './base/sealed'
import { BytesString } from './bytes'

export type KeyType = 'priv' | 'xpriv' | 'pub' | 'xpub'

interface BaseKey<_Type extends KeyType> extends Sealed<_Type>, BytesString {}

export interface SecretKey extends BaseKey<'priv'> {}
export interface ExtendedSecretKey extends BaseKey<'xpriv'> {}

export interface PublicKey extends BaseKey<'pub'> {}
export interface ExtendedPublicKey extends BaseKey<'xpub'> {}

interface BaseKeyPair<_SecretKey extends SecretKey | ExtendedSecretKey, _PublicKey extends PublicKey | ExtendedPublicKey> {
  secretKey: _SecretKey
  publicKey: _PublicKey
}

export type KeyPair = BaseKeyPair<SecretKey, PublicKey>
export type ExtendedKeyPair = BaseKeyPair<ExtendedSecretKey, ExtendedPublicKey>
