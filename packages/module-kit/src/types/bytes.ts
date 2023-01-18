export type BytesStringFormat = 'hex' | 'encoded'
export interface BytesString {
  format: BytesStringFormat
  value: string
}

export interface HexString extends BytesString {
  format: 'hex'
}
