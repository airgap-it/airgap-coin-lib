export interface ItemStoreRequest {
  id: string // Message ID used to match request/reaponse
  encryptedPayload: string // Payload to be stored in the Vault
}
