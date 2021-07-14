export interface AccountShareResponse {
  publicKey: string // Public Key of the account
  derivationPath: string // Derivation path of the account
  isExtendedPublicKey: boolean // Whether or not the public key is an extended public key
  masterFingerprint: string // Secret's fingerprint
  isActive: boolean // Whether or not the account should be visible
  groupId: string // A unique id of the accounts group
  groupLabel: string // Name of the group
}
