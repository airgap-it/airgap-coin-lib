import { ExtendedKeyPair, ExtendedPublicKey, KeyPair, PublicKey } from '../../../types/key'
import { Signature } from '../../../types/signature'
import { AnyProtocol, BaseProtocol, OfflineProtocol } from '../../protocol'
import { BaseBip32Protocol, OfflineBip32Protocol } from '../bip/Bip32OverridingExtension'

export type SignMessageExtension<T extends AnyProtocol> = T extends OfflineBip32Protocol<any, any, any, any, any, any>
  ? OfflineSignMessageWithExtendedKeyPair
  : T extends BaseBip32Protocol<any, any, any, any, any, any>
  ? BaseSignMessageWithExtendedKeyPair
  : T extends OfflineProtocol<any>
  ? OfflineSignMessageWithNonExtendedKeyPair
  : T extends BaseProtocol<any>
  ? BaseSignMessageWithNonExtendedKeyPair
  : never

export interface BaseSignMessageWithNonExtendedKeyPair {
  verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey): Promise<boolean>
}

export interface OfflineSignMessageWithNonExtendedKeyPair extends BaseSignMessageWithNonExtendedKeyPair {
  signMessageWithKeyPair(message: string, keyPair: KeyPair): Promise<Signature>
}

export interface BaseSignMessageWithExtendedKeyPair {
  verifyMessageWithPublicKey(message: string, signature: Signature, publicKey: PublicKey | ExtendedPublicKey): Promise<boolean>
}

export interface OfflineSignMessageWithExtendedKeyPair extends BaseSignMessageWithExtendedKeyPair {
  signMessageWithKeyPair(message: string, keyPair: KeyPair | ExtendedKeyPair): Promise<Signature>
}
