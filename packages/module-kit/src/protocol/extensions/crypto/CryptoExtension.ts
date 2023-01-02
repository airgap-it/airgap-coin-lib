import { AnyProtocol, OfflineProtocol } from '../../protocol'

import { AESExtension } from './AESExtension'
import { AsymmetricEncryptionExtension } from './AsymmetricEncryptionExtension'
import { SignMessageExtension } from './SignMessageExtension'

export type CryptoExtension<T extends AnyProtocol> = SignMessageExtension<T> &
  AsymmetricEncryptionExtension<T> &
  (T extends OfflineProtocol<any> ? AESExtension<T> : {})
