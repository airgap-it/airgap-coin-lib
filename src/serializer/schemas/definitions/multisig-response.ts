export interface MultisigResponse {
  signingPeers: string[] // A list of the peerIds that signed the request
  transaction: string // The transaction that was signed
  signature: string // The signature of the other peers and the devices
}
