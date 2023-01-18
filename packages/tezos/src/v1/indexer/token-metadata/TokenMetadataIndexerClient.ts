import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'

export interface TokenMetadataIndexerClient {
  getTokenMetadata(tokenIDs?: number[]): Promise<Record<number, Partial<TezosFATokenMetadata>> | undefined>
}
