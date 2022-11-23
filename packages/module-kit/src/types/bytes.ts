export type BytesStringFormat = 'hex' | 'encoded'
export interface BytesString {
  format: BytesStringFormat
  value: string
}
