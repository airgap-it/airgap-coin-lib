export interface MultisigRequest {
  signingPeers: string[] // A list of the peerIds that signed the request
  transaction: string // The transaction to be signed
  signature: string // The signature of the other peers
  publicKey: string // Public key to sign the transaction
  callbackURL: string // eg. https://airgap.it/?data={{data}}
}
