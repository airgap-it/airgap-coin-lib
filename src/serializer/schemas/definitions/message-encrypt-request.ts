export interface MessageEncryptRequest {
  method: 'symmetric' | 'asymmetric'
  message: string // Message to be encrypted
  publicKey: string // Allows wallet to pre-select account
  protocol: string // Protocol, can be empty for gpg
  publicKeyToEncryptResponse: string
  callbackURL: string // eg. https://airgap.it/?data={{data}}
}
