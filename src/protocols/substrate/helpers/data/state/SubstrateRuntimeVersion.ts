export interface SubstrateRuntimeVersion {
  specName: string
  implName: string
  authoringVersion: number
  specVersion: number
  implVersion: number
  apis: [string, number][]
  transactionVersion: number
}
