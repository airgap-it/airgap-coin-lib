import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import * as rlp from '@airgap/coinlib-core/dependencies/src/rlp-2.2.3/index'
import { SerializerError, SerializerErrorType } from '@airgap/coinlib-core/errors'

import { IACMessageDefinitionObject } from './message'
import { ChunkedPayload } from './payloads/chunked-payload'
import { FullPayload } from './payloads/full-payload'
import { Payload } from './payloads/payload'
import { IACPayloadType, Serializer } from './serializer'

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
      throw new SerializerError(SerializerErrorType.PAYLOAD_TYPE_UNKNOWN, `Is neither "Full" nor "Chunked".`)
    }
  }

  public decoded(): IACProtocolType {
    return [this.version, this.payloadType, this.payload]
  }

  public encoded(serializer: Serializer = Serializer.getInstance()): string {
    return bs58check.encode(
      rlp.encode([this.version.toString(), this.payloadType.toString(), this.payload.asArray(serializer) as any]) as any
    )
  }

  public static fromDecoded(
    data: IACMessageDefinitionObject[],
    singleChunkSize: number = 0,
    multiChunkSize: number = 0,
    serializer: Serializer = Serializer.getInstance()
  ): IACProtocol[] {
    const payload: FullPayload = FullPayload.fromDecoded(data)
    const rawPayload: Buffer = payload.asBuffer(serializer)
    if (singleChunkSize > 0 && rawPayload.length > singleChunkSize) {
      const chunks: Buffer[] = []
      const nodeBuffer: Buffer = rawPayload
      const bufferLength: number = rawPayload.length

      let i: number = 0
      while (i < bufferLength) {
        chunks.push(nodeBuffer.slice(i, (i += multiChunkSize)))
      }

      return chunks.map(
        (chunk: Buffer, index: number) =>
          new IACProtocol(ChunkedPayload.fromDecoded({ currentPage: index, total: chunks.length, payload: chunk }))
      )
    } else {
      return [new IACProtocol(payload)]
    }
  }

  public static fromEncoded(data: string[], serializer: Serializer = Serializer.getInstance()): IACProtocol[] {
    const chunked: ChunkedPayload[] = []
    let finalPayload: Payload | undefined

    // make sure that all are the same type
    let globalType: number | undefined
    data.forEach((entry: string) => {
      const decoded: Buffer[] = rlp.decode(bs58check.decode(entry))
      // const version: string = decoded[0].toString()
      const type: number = parseInt(decoded[1].toString(), 10)

      globalType = globalType ?? type
      if (globalType !== type) {
        throw new SerializerError(SerializerErrorType.PAYLOAD_TYPE_MISMATCH, 'All types within a group must either be "full" or "chunked".')
      }

      if (type === IACPayloadType.FULL) {
        const payload: Buffer[] = (decoded[2] as any) as Buffer[]
        finalPayload = FullPayload.fromEncoded(payload, serializer)
      } else if (type === IACPayloadType.CHUNKED) {
        const payload: [Buffer, Buffer, Buffer] = (decoded[2] as any) as [Buffer, Buffer, Buffer]
        chunked.push(ChunkedPayload.fromEncoded(payload))
      } else {
        throw new SerializerError(SerializerErrorType.PAYLOAD_TYPE_NOT_SUPPORTED, `Type "${type}" is unknown.`)
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

      finalPayload = FullPayload.fromEncoded(rlp.decode(Buffer.concat(arr)), serializer)
    }

    return [new IACProtocol(finalPayload)]
  }
}
