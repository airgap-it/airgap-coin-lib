import { PublicKey, ExtendedPublicKey } from '../../../types/key'
import { UnsignedTransaction } from '../../../types/transaction'
import { _AnyProtocol, _BaseProtocol } from '../../protocol'

export type MultisigExtension<T extends _AnyProtocol> =
  T extends _BaseProtocol<any, any, any, any, any, any, infer _PublicKey> ? MultisigProtocol<_PublicKey, UnsignedTransaction> : never

export interface MultisigProtocol<
  _PublicKey extends PublicKey | ExtendedPublicKey = PublicKey,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction
> {
  getMultisigStatus(publicKey: PublicKey): Promise<boolean>

  //   getSigners(publicKey: PublicKey): Promise<string[]>

  //   addSigner(publicKey: _PublicKey, extra?: any): Promise<_UnsignedTransaction>

  //   removeSigner(publicKey: _PublicKey, extra?: any): Promise<_UnsignedTransaction>
}
