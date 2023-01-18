export interface UnsignedTransaction {
  transaction: any // TODO: Type
  publicKey: string
  callbackURL?: string // eg. https://airgap.it/?data={{data}}
}
