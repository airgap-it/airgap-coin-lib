import { Signature } from '../types/signature'

export function signature(value: string, format: Signature['format'] = 'encoded'): Signature {
  return { value, format }
}
