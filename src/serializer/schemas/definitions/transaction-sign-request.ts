export interface UnsignedTransaction {
  id: string // Message ID used to match request/reaponse
  transaction: any // TODO: Type
  publicKey: string
  callback?: string
}
