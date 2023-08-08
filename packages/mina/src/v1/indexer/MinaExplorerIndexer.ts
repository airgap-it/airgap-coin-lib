import { gql, request } from 'graphql-request'

import { AccountTransaction } from '../types/indexer'

import { MinaIndexer } from './MinaIndexer'

interface GetTransactionsResponse {
  transactions?: Partial<AccountTransaction>[]
}

interface GetBlocksResponse {
  blocks?: {
    blockHeight?: number | null
  }[]
}

interface GetFeesResponse {
  transactions?: {
    fee?: string | number | null
  }[]
}

const EMPTY_MEMO: string = 'E4YM2vTHhWEg66xpj52JErHUBU4pZ1yageL4TVDDpTTSsv8mK6YaH'

export class MinaExplorerIndexer implements MinaIndexer {
  public constructor(private readonly url: string) {}

  public async getTransactions(publicKey: string, limit: number, dateTimeOffset?: string): Promise<AccountTransaction[]> {
    const query = gql`
      query GetTransactions($publicKey: String!, $limit: Int!, $dateTimeOffset: DateTime) {
        transactions(
          limit: $limit
          sortBy: DATETIME_DESC
          query: { canonical: true, OR: [{ to: $publicKey }, { from: $publicKey }], dateTime_lt: $dateTimeOffset }
        ) {
          to
          from
          amount
          fee
          memo
          hash
          dateTime
          failureReason
        }
      }
    `

    const response: GetTransactionsResponse = await request(this.url, query, {
      publicKey,
      limit,
      dateTimeOffset: dateTimeOffset ?? null
    })

    return (
      response.transactions?.map((transaction: Partial<AccountTransaction>) => ({
        to: transaction.to ?? '',
        from: transaction.from ?? '',
        amount: transaction.amount ?? 0,
        fee: transaction.fee ?? 0,
        memo: transaction.memo && transaction.memo !== EMPTY_MEMO ? transaction.memo : undefined,
        kind: transaction.kind ?? undefined,
        hash: transaction.hash ?? undefined,
        dateTime: transaction.dateTime ?? '',
        failureReason: transaction.failureReason ?? undefined
      })) ?? []
    )
  }

  public async getLatestFees(blockSpan: number): Promise<string[]> {
    const blockQuery = gql`
      query GetLatestBlock {
        blocks(limit: 1, sortBy: DATETIME_DESC, query: { canonical: true }) {
          blockHeight
        }
      }
    `

    const blocksResponse: GetBlocksResponse = await request(this.url, blockQuery)
    const blockHeight = (blocksResponse?.blocks ?? [])[0]?.blockHeight
    if (!blockHeight) {
      return []
    }

    const feesQuery = gql`
      query GetFees($minBlockHeight: Int) {
        transactions(sortBy: FEE_ASC, query: { canonical: true, blockHeight_gt: $minBlockHeight }) {
          fee
        }
      }
    `

    const feesResponse: GetFeesResponse = await request(this.url, feesQuery, {
      minBlockHeight: blockHeight - blockSpan
    })

    return feesResponse.transactions?.map(({ fee }) => (fee ?? 0).toString()) ?? []
  }
}
