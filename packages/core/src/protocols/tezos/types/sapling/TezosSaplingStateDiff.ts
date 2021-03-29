import { TezosSaplingCiphertext } from './TezosSaplingCiphertext'

export interface TezosSaplingStateDiff {
  root: string
  commitments_and_ciphertexts: [string, TezosSaplingCiphertext][]
  nullifiers: string[]
}