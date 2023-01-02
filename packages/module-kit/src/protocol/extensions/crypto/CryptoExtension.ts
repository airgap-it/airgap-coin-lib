import { _AnyProtocol, _OfflineProtocol } from '../../protocol'

import { AESExtension } from './AESExtension'
import { AsymmetricEncryptionExtension } from './AsymmetricEncryptionExtension'
import { SignMessageExtension } from './SignMessageExtension'

export type CryptoExtension<T extends _AnyProtocol> = SignMessageExtension<T> &
  AsymmetricEncryptionExtension<T> &
  (T extends _OfflineProtocol ? AESExtension<T> : {})
