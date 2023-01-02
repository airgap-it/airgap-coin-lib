import { ExtendedSecretKey, SecretKey } from '../../../types/key'
import { OfflineProtocol } from '../../protocol'
import { OfflineBip32Protocol } from '../bip/Bip32OverridingExtension'

export type AESExtension<T extends OfflineProtocol> = T extends OfflineBip32Protocol<any, any, any, any, any, any>
  ? AESWithExtendedKeyPair
  : T extends OfflineProtocol<any>
  ? AESWithNonExtendedKeyPair
  : never

export interface AESWithNonExtendedKeyPair {
  encryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string>
  decryptAESWithSecretKey(payload: string, secretKey: SecretKey): Promise<string>
}

export interface AESWithExtendedKeyPair {
  encryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string>
  decryptAESWithSecretKey(payload: string, secretKey: SecretKey | ExtendedSecretKey): Promise<string>
}
