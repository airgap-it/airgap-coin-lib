export interface ItemStoreRequest {
  storageId: string // The ID of the item in the Vault storage
  encryptionPublicKey: string // The public key with which the response will be encrypted
}
