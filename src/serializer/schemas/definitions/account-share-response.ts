export interface AccountShareResponse {
  publicKey: string // Public Key of the account
  derivationPath: string // Derivation path of the account
  isExtendedPublicKey: boolean // Whether or not the public key is an extended public key
  group: string // The name or ID of the secret. This allows for grouping accounts on the wallet side
}
