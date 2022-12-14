export interface TezosFA2UpdateOperatorRequest {
  operation: 'add' | 'remove'
  owner: string
  operator: string
  tokenId: number
}
