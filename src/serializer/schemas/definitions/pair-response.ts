export interface PairResponse {
  id: string // Message ID used to match request/reaponse
  peerId: string
  name: string
  publicKey: string // Public Key of the account
}
