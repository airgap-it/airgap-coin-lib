export interface MessageSignResponse {
  message: string // Message to be signed
  publicKey: string // PublicKey of the signer
  signature: string // Signature of the message
  isValid: boolean // If the signature matches or not
}
