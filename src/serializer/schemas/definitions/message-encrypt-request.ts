export interface MessageEncryptRequest {
  id: string // Message ID used to match request/reaponse
  type: 'encrypt' | 'decrypt'
  method: 'symmetric' | 'asymmetric?'
  message: string // Message to be signed
  publicKey: string // Allows wallet to pre-select account
  protocol: string // Protocol, can be empty for gpg
  publicKeyToEncryptResponse: string
  callbackURL: string // eg. https://airgap.it/?signedMessage=
}
