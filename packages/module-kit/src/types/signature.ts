export type SignatureFormat = 'hex' | 'encoded'

export interface Signature {
  format: SignatureFormat
  value: string
}
