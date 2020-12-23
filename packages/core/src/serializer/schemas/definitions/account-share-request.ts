export interface AccountShareRequest {
  protocols: string[] // Protocols that the wallet requests
  callbackURL?: string // eg. https://airgap.it/?data={{data}}
}
