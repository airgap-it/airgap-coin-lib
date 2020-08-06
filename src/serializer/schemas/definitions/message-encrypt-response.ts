export interface MessageEncryptResponse {
  method: 'symmetric' | 'asymmetric'
  protocol: string // Protocol, can be empty for gpg
  publicKey: string // PublicKey of the encrypter
  payload: string // Message to be signed
}
