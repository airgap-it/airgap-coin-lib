import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'

export interface TokenMetadataIndexer {
  getTokenMetadata(tokenIDs?: number[]): Promise<Record<number, Partial<TezosFATokenMetadata>> | undefined>
}
