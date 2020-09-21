export interface AccountShareResponse {
  publicKey: string // Public Key of the account
  // TODO: derivationPath should be removed in the next breaking change
  derivationPath: string // Derivation path of the account
  isExtendedPublicKey: boolean // Whether or not the public key is an extended public key
  // TODO: group should be enabled in the next breaking change
  // group: string // The name or ID of the secret. This allows for grouping accounts on the wallet side
}
