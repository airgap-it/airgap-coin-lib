export interface AccountShareRequest {
  id: string // Message ID used to match request/reaponse
  protocols: string[] // Protocols that the wallet requests
}
