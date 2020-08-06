export interface MessageSignRequest {
  message: string // Message to be signed
  protocol: string // Protocol used for signing
  publicKey: string // Allows wallet to pre-select signing identity
  callbackURL: string // eg. https://airgap.it/?signedMessage={{data}}
}
