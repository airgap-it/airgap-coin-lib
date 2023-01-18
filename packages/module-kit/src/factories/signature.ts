import { Signature } from '../types/signature'

export function newSignature(value: string, format: Signature['format'] = 'encoded'): Signature {
  return { value, format }
}
