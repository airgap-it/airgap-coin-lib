import { gql, request } from 'graphql-request'

import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'
import { TokenMetadataIndexer } from './TokenMetadataIndexer'

interface Token {
  symbol: string | null
  name: string | null
  decimals: number | null
  token_id: string
  metadata: string | null
}

interface TokenResponse {
  token: Token[]
}

const OBJKT_API_URL = 'https://data.objkt.com/v2/graphql'

export class ObjktTokenMetadataIndexer implements TokenMetadataIndexer {
  public constructor(private readonly contractAddress: string, private readonly apiUrl: string = OBJKT_API_URL) {}

  public async getTokenMetadata(tokenIDs?: number[]): Promise<Record<number, Partial<TezosFATokenMetadata>> | undefined> {
    const token_idIn: string = tokenIDs !== undefined ? `_in: [${tokenIDs.map((id: number) => `"${id}"`).join(', ')}]` : '_nin: []'

    const query = gql`
      {
        token(where: {
          fa_contract: {
            _eq: "${this.contractAddress}"
          },
          token_id: {
            ${token_idIn}
          }
        }) {
          symbol
          name
          decimals
          token_id
        }
      }
    `

    const response: TokenResponse = await request(this.apiUrl, query)
    if (response.token.length === 0) {
      return undefined
    }

    return response.token.reduce((obj: Record<number, Partial<TezosFATokenMetadata>>, next: Token) => {
      const { token_id: tokenId, ...metadata } = next

      return Object.assign(obj, {
        [parseInt(tokenId, 10)]: {
          symbol: metadata.symbol ?? undefined,
          name: metadata.name ?? undefined,
          decimals: metadata.decimals ?? undefined
        }
      })
    }, {})
  }
}
