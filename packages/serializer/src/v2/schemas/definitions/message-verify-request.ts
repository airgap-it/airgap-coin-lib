export interface MessageSignRequest {
  message: string // Message to be signed
  publicKey: string // PublicKey of the signer
  signature: string // Signature of the message
  callbackURL?: string // eg. https://airgap.it/?data={{data}}
}
