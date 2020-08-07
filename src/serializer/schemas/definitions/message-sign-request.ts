export interface MessageSignRequest {
  message: string // Message to be signed
  publicKey: string // Allows wallet to pre-select signing identity
  callbackURL: string // eg. https://airgap.it/?signedMessage={{data}}
}
