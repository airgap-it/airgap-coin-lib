import { ExtendedKeyPair, ExtendedPublicKey, KeyPair, PublicKey } from '../../../types/key'
import { Signature } from '../../../types/signature'
import { _AnyProtocol, _BaseProtocol, _OfflineProtocol } from '../../protocol'

export type SignMessageExtension<T extends _AnyProtocol> = T extends _OfflineProtocol<
  any,
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
  ? OfflineSignMessage<_PublicKey, _KeyPair>
  : T extends _BaseProtocol<any, any, any, any, any, any, infer _PublicKey>
  ? BaseSignMessage<_PublicKey>
  : never

export interface BaseSignMessage<_PublicKey extends PublicKey | ExtendedPublicKey = PublicKey> {
  verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: _PublicKey): Promise<boolean>
}

export interface OfflineSignMessage<
  _PublicKey extends PublicKey | ExtendedPublicKey = PublicKey,
  _KeyPair extends KeyPair | ExtendedKeyPair = KeyPair
> extends BaseSignMessage<_PublicKey> {
  signMessageWithKeyPair(message: string, keyPair: _KeyPair): Promise<Signature>
}
