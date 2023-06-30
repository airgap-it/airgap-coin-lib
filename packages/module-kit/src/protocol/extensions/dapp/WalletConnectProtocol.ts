import { ExtendedPublicKey, PublicKey } from '../../../types/key'
import { UnsignedTransaction } from '../../../types/transaction'
import { _OnlineProtocol } from '../../protocol'

export type WalletConnectExtension<T extends _OnlineProtocol> = T extends _OnlineProtocol<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  infer _UnsignedTransaction,
  any,
  infer _PublicKey
>
  ? WalletConnectProtocol<_UnsignedTransaction, _PublicKey>
  : never

export interface WalletConnectRequest {
  from?: string
  to?: string
  data?: string
  gasLimit?: string
  gasPrice?: string
  value?: string
  nonce?: string
}

export interface WalletConnectProtocol<
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction,
  _PublicKey extends PublicKey | ExtendedPublicKey = PublicKey | ExtendedPublicKey
> {
  getWalletConnectChain(): Promise<string>
  prepareWalletConnectTransactionWithPublicKey(publicKey: _PublicKey, request: WalletConnectRequest): Promise<_UnsignedTransaction>
}
