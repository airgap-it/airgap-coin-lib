export interface MessageSignRequest {
  message: string // Message to be signed
  publicKey: string // Allows wallet to pre-select signing identity
  ttl: string // Blockheight or timestamp to prevent replay attacks
  origin: string // eg. airgap.it
  callbackURL: string // eg. https://airgap.it/?signedMessage=
}
