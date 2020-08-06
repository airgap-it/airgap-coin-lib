import * as bs58check from '../dependencies/src/bs58check-2.1.2/index'
import * as rlp from '../dependencies/src/rlp-2.2.3/index'

import { IACMessageDefinitionObject } from './message'
import { ChunkedPayload } from './payloads/chunked-payload'
import { FullPayload } from './payloads/full-payload'
import { Payload } from './payloads/payload'
import { IACPayloadType } from './serializer'

export type IACProtocolVersion = number
export type IACProtocolType = [IACProtocolVersion, IACPayloadType, Payload]

function sortByPage(a: ChunkedPayload, b: ChunkedPayload): number {
  return a.currentPage - b.currentPage
}

// IACProtocolMessage instead of IACProtocol?
export class IACProtocol {
  public readonly version: number = 2
  public readonly payloadType: IACPayloadType
  public payload: Payload

  constructor(data: Payload) {
    if (data instanceof FullPayload) {
      this.payloadType = IACPayloadType.FULL
      this.payload = data
    } else if (data instanceof ChunkedPayload) {
      this.payloadType = IACPayloadType.CHUNKED
      this.payload = data
    } else {
      throw new Error('Unknown Payload type!')
    }
  }

  public decoded(): IACProtocolType {
    return [this.version, this.payloadType, this.payload]
  }

  public encoded(): string {
    return bs58check.encode(rlp.encode([this.version.toString(), this.payloadType.toString(), this.payload.asArray() as any]) as any)
  }

  public static fromDecoded(data: IACMessageDefinitionObject[], chunkSize: number = 0): IACProtocol[] {
    const payload: FullPayload = FullPayload.fromDecoded(data)
    const rawPayload: Buffer = payload.asBuffer()

    if (chunkSize > 0 && rawPayload.length > chunkSize) {
      const chunks: Buffer[] = []
      const nodeBuffer: Buffer = rawPayload
      const bufferLength: number = rawPayload.length

      let i: number = 0
      while (i < bufferLength) {
        chunks.push(nodeBuffer.slice(i, (i += chunkSize)))
      }

      return chunks.map(
        (chunk: Buffer, index: number) =>
          new IACProtocol(ChunkedPayload.fromDecoded({ currentPage: index, total: chunks.length, payload: chunk }))
      )
    } else {
      return [new IACProtocol(payload)]
    }
  }

  public static fromEncoded(data: string[]): IACProtocol[] {
    const chunked: ChunkedPayload[] = []
    let finalPayload: Payload | undefined

    // make sure that all are the same type
    let globalType: string | undefined
    data.forEach((entry: string) => {
      const decoded: Buffer[] = rlp.decode(bs58check.decode(entry))
      // const version: string = decoded[0].toString()
      const type: string = decoded[1].toString()

      globalType = globalType || type
      if (globalType !== type) {
        throw new Error('NOT SAME TYPE')
      }

      if (type === '0') {
        // full
        const payload: Buffer[] = (decoded[2] as any) as Buffer[]
        finalPayload = FullPayload.fromEncoded(payload)
      } else if (type === '1') {
        // chunked
        const payload: [Buffer, Buffer, Buffer] = (decoded[2] as any) as [Buffer, Buffer, Buffer]
        chunked.push(ChunkedPayload.fromEncoded(payload))
      } else {
        throw new Error('EMPTY ARRAY')
      }
    })

    if (!finalPayload) {
      const sortedChunks: ChunkedPayload[] = chunked.sort(sortByPage)
      const arr: Buffer[] = sortedChunks.map((chunk: ChunkedPayload) => chunk.buffer)

      const result: { availablePages: number[]; totalPages: number } = {
        availablePages: sortedChunks.map((a) => a.currentPage),
        totalPages: sortedChunks[0].total
      }

      if (result.availablePages.length < result.totalPages) {
        throw result
      }

      finalPayload = FullPayload.fromEncoded(rlp.decode(Buffer.concat(arr)))
    }

    return [new IACProtocol(finalPayload)]
  }
}
