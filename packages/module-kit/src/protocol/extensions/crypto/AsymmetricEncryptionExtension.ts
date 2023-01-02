import { ExtendedKeyPair, ExtendedPublicKey, KeyPair, PublicKey } from '../../../types/key'
import { AnyProtocol, BaseProtocol, OfflineProtocol } from '../../protocol'
import { BaseBip32Protocol, OfflineBip32Protocol } from '../bip/Bip32OverridingExtension'

export type AsymmetricEncryptionExtension<T extends AnyProtocol> = T extends OfflineBip32Protocol<any, any, any, any, any, any>
  ? OfflineAsymmetricEncryptionWithExtendedKeyPair
  : T extends BaseBip32Protocol<any, any, any, any, any, any>
  ? BaseAsymmetricEncryptionWithExtendedKeyPair
  : T extends OfflineProtocol<any>
  ? OfflineAsymmetricEncryptionWithNonExtendedKeyPair
  : T extends BaseProtocol<any>
  ? BaseAsymmetricEncryptionWithNonExtendedKeyPair
  : never

export interface BaseAsymmetricEncryptionWithNonExtendedKeyPair {
  encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey): Promise<string>
}

export interface OfflineAsymmetricEncryptionWithNonExtendedKeyPair extends BaseAsymmetricEncryptionWithNonExtendedKeyPair {
  decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair): Promise<string>
}

export interface BaseAsymmetricEncryptionWithExtendedKeyPair {
  encryptAsymmetricWithPublicKey(payload: string, publicKey: PublicKey | ExtendedPublicKey): Promise<string>
}

export interface OfflineAsymmetricEncryptionWithExtendedKeyPair extends BaseAsymmetricEncryptionWithExtendedKeyPair {
  decryptAsymmetricWithKeyPair(payload: string, keyPair: KeyPair | ExtendedKeyPair): Promise<string>
}
