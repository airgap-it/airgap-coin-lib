import { AccountBalance } from '../types/node'
import { MinaPayment, MinaSignature } from '../types/transaction'

export interface MinaNode {
  getNonce(publicKey: string): Promise<string>
  getBalance(publicKey: string): Promise<AccountBalance>
  sendTransaction(payment: MinaPayment, signature: MinaSignature): Promise<string>
}
