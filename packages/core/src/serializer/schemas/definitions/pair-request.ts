export interface PairRequest {
  peerId: string // Id of the peer
  appName: string // Name of the app (eg. AirGap Vault)
  appVersion: string // Verson of the app (eg. 1.0.0)
  publicKey: string // Public Key of the account
  callbackURL?: string // eg. https://airgap.it/?data={{data}}
}
