export interface TransactionSignRequest<T = any> {
  transaction: T
  publicKey: string
  callbackURL?: string
}
