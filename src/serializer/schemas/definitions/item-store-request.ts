export interface ItemStoreRequest {
  id: string // Message ID used to match request/response
  payload: string // Payload to be stored in the Vault
  callbackURL?: string // eg. https://airgap.it/?data={{data}}
}
