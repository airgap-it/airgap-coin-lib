import { ExtendedKeyPair, ExtendedPublicKey, KeyPair, PublicKey } from '../../../types/key'
import { _AnyProtocol, _BaseProtocol, _OfflineProtocol } from '../../protocol'

export type AsymmetricEncryptionExtension<T extends _AnyProtocol> = T extends _OfflineProtocol<
  any,
  any,
  any,
  any,
  any,
  any,
  infer _PublicKey,
  any,
  infer _KeyPair
>
  ? OfflineAsymmetricEncryption<_PublicKey, _KeyPair>
  : T extends _BaseProtocol<any, any, any, any, any, any, infer _PublicKey>
  ? BaseAsymmetricEncryption<_PublicKey>
  : never

export interface BaseAsymmetricEncryption<_PublicKey extends PublicKey | ExtendedPublicKey = PublicKey> {
  encryptAsymmetricWithPublicKey(payload: string, publicKey: _PublicKey): Promise<string>
}

export interface OfflineAsymmetricEncryption<
  _PublicKey extends PublicKey | ExtendedPublicKey = PublicKey,
  _KeyPair extends KeyPair | ExtendedKeyPair = KeyPair
> extends BaseAsymmetricEncryption<_PublicKey> {
  decryptAsymmetricWithKeyPair(payload: string, keyPair: _KeyPair): Promise<string>
}
