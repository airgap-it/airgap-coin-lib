export interface ItemStoreRequest {
  id: string // Message ID used to match request/reaponse
  storageId: string // The ID of the item in the Vault storage
  encryptionPublicKey: string // The public key with which the response will be encrypted
}
