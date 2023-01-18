import { hexToBytes } from '@airgap/coinlib-core/utils/hex'
import { RemoteData } from '@airgap/coinlib-core/utils/remote-data/RemoteData'
import { RemoteDataFactory } from '@airgap/coinlib-core/utils/remote-data/RemoteDataFactory'
import { TezosContractRemoteDataFactory } from '../../contract/remote-data/TezosContractRemoteDataFactory'
import { TezosContract } from '../../contract/TezosContract'
import { TezosUtils } from '../../TezosUtils'
import { BigMapEntry } from '../../types/contract/BigMapEntry'
import { TezosFATokenMetadata } from '../../types/fa/TezosFATokenMetadata'
import { TokenMetadataIndexer } from './TokenMetadataIndexer'

export class BigMapTokenMetadataIndexer implements TokenMetadataIndexer {
  public readonly remoteDataFactory: RemoteDataFactory = new TezosContractRemoteDataFactory()

  public constructor(private readonly contract: TezosContract, private readonly bigMapID?: number) {}

  public async getTokenMetadata(tokenIDs?: number[]): Promise<Record<number, TezosFATokenMetadata> | undefined> {
    const bigMapID = this.bigMapID ?? (await this.contract.findBigMap('token_metadata'))
    if (bigMapID === undefined) {
      return undefined
    }

    const entries: BigMapEntry<'json'>[] = await this.contract.getBigMapValues({
      bigMap: {
        id: bigMapID,
        path: 'token_metadata'
      },
      filters:
        tokenIDs !== undefined && tokenIDs.length > 0
          ? [
              tokenIDs.length > 1
                ? {
                    field: 'key',
                    operation: 'in',
                    value: `[${tokenIDs.join(',')}]`
                  }
                : {
                    field: 'key',
                    operation: 'eq',
                    value: tokenIDs[0].toString()
                  }
            ]
          : undefined,
      resultType: 'json'
    })
    const values = entries.map((entry: BigMapEntry<'json'>) => entry.value)
    const tokenMetadata: ([number, TezosFATokenMetadata] | undefined)[] = await Promise.all(
      values.map(async (value) => {
        const tokenID = value?.token_id ? parseInt(value.token_id, 10) : undefined
        const tokenInfo = value?.token_info as Record<string, string>
        if (tokenID === undefined || tokenInfo === undefined) {
          return undefined
        }

        if ('' in tokenInfo) {
          const uriEncoded = tokenInfo['']
          const remoteData = this.createRemoteData(uriEncoded)
          const tokenMetdata = await remoteData?.get()
          if (this.isTokenMetadata(tokenMetdata)) {
            return [tokenID, tokenMetdata]
          }
        }

        const name = tokenInfo['name']
        const symbol = tokenInfo['symbol']
        const decimals = tokenInfo['decimals']

        if (!name || !symbol || !decimals) {
          return undefined
        }

        return [
          tokenID,
          {
            ...Array.from(Object.entries(tokenInfo)).reduce((obj, next) => {
              const key = next[0]
              let value: string | number | boolean = typeof next[1] === 'string' ? hexToBytes(next[1]).toString() : next[1]
              if (value === 'true') {
                value = true
              } else if (value === 'false') {
                value = false
              } else if (!isNaN(parseInt(value))) {
                value = parseInt(value)
              }

              return Object.assign(obj, {
                [key]: value
              })
            }, {}),
            name: hexToBytes(name).toString(),
            symbol: hexToBytes(symbol).toString(),
            decimals: parseInt(hexToBytes(decimals).toString())
          }
        ] as [number, TezosFATokenMetadata]
      })
    )

    return tokenMetadata.reduce((obj, next) => (next ? Object.assign(obj, { [next[0]]: next[1] }) : obj), {})
  }

  private createRemoteData(uriEncoded: string): RemoteData<unknown> | undefined {
    // unless otherwise-specified, the encoding of the values must be the direct stream of bytes of the data being stored.
    let remoteData = this.remoteDataFactory.create(hexToBytes(uriEncoded).toString().trim(), { contract: this.contract })
    if (!remoteData && uriEncoded.startsWith('05')) {
      // however, sometimes the URI is a packed value
      remoteData = this.remoteDataFactory.create(TezosUtils.parseHex(uriEncoded).asRawValue(), { contract: this.contract })
    }

    return remoteData
  }

  private isTokenMetadata(obj: unknown): obj is TezosFATokenMetadata {
    return typeof obj === 'object' && obj !== null && 'symbol' in obj && 'name' in obj && 'decimals' in obj
  }
}
