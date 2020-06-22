import * as bs58check from '../dependencies/src/bs58check-2.1.2/index'
import * as rlp from '../dependencies/src/rlp-2.2.3/index'

import { assertNever, IACMessageDefinitionObject } from './message'
import { ChunkedPayload } from './payloads/chunked-payload'
import { FullPayload } from './payloads/full-payload'
import { Payload, PayloadType } from './payloads/payload'
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

  constructor(type: PayloadType, data: string | Payload) {
    if (type === PayloadType.DECODED) {
      if (data instanceof FullPayload) {
        this.payloadType = IACPayloadType.FULL
        this.payload = data
      } else if (data instanceof ChunkedPayload) {
        this.payloadType = IACPayloadType.CHUNKED
        this.payload = data
      } else {
        throw new Error('IACPayloadType not supported')
      }
    } else if (type === PayloadType.ENCODED) {
      // Encoded string and we need to decode it
      // We can then initialize it either as Chunked or Full
      this.payloadType = IACPayloadType.FULL
      this.payload = new FullPayload(PayloadType.ENCODED, data as any) // TODO: Placeholder
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }
  }

  public decoded(): IACProtocolType {
    return [this.version, this.payloadType, this.payload]
  }

  public encoded(): string {
    return bs58check.encode(rlp.encode([this.version.toString(), this.payloadType.toString(), this.payload.asArray() as any]) as any)
  }

  public static create(data: IACMessageDefinitionObject[], chunkSize: number = 0): IACProtocol[] {
    const payload: FullPayload = new FullPayload(PayloadType.DECODED, data)

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
          new IACProtocol(
            PayloadType.DECODED,
            new ChunkedPayload(PayloadType.DECODED, { currentPage: index, total: chunks.length, payload: chunk })
          )
      )
    } else {
      return [new IACProtocol(PayloadType.DECODED, payload)]
    }
  }

  public static createFromEncoded(data: string[]): IACProtocol[] {
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

      const payload: Buffer[] = (decoded[2] as any) as Buffer[]

      if (type === '0') {
        // full
        finalPayload = new FullPayload(PayloadType.ENCODED, payload)
      } else if (type === '1') {
        // chunked
        chunked.push(new ChunkedPayload(PayloadType.ENCODED, payload))
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

      finalPayload = new FullPayload(PayloadType.ENCODED, rlp.decode(Buffer.concat(arr)))
    }

    return [new IACProtocol(PayloadType.DECODED, finalPayload)]
  }
}
