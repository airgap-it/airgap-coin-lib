import { ExtendedSecretKey, SecretKey } from '../../../types/key'
import { _OfflineProtocol } from '../../protocol'

export type AESExtension<T extends _OfflineProtocol> = T extends _OfflineProtocol<any, any, any, any, any, any, any, any, infer _SecretKey>
  ? AES<_SecretKey>
  : never

export interface AES<_SecretKey extends SecretKey | ExtendedSecretKey = SecretKey> {
  encryptAESWithSecretKey(payload: string, secretKey: _SecretKey): Promise<string>
  decryptAESWithSecretKey(payload: string, secretKey: _SecretKey): Promise<string>
}
