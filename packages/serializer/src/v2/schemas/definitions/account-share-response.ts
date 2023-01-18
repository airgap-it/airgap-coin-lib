export interface AccountShareResponse {
  publicKey: string // Public Key of the account
  derivationPath: string // Derivation path of the account
  isExtendedPublicKey: boolean // Whether or not the public key is an extended public key
}
