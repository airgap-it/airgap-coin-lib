export interface RawEthereumTransaction {
  nonce: string
  gasPrice: string
  gasLimit: string
  to: string
  value: string
  chainId: number
  data: string
}

export interface RawTypedEthereumTransaction {
  serialized: string
  derivationPath: string
  masterFingerprint: string
}
