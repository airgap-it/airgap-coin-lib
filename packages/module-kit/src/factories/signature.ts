import { Signature, SignatureFormat } from '../types/signature'

export function signature(value: string, format: SignatureFormat = 'encoded'): Signature {
  return { value, format }
}
