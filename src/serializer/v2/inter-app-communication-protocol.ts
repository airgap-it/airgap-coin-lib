import * as bs58check from '../../dependencies/src/bs58check-2.1.2/index'
import * as rlp from '../../dependencies/src/rlp-2.2.3/index'

import { ChunkedPayload } from './chunked-payload'
import { FullPayload } from './full-payload'
import { assertNever, IACMessageDefinition } from './message'
import { Payload, PayloadType } from './payload'
import { IACPayloadType } from './serializer.new'

export type IACProtocolVersion = number
export type IACProtocolType = [IACProtocolVersion, IACPayloadType, Payload]

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
    console.log('before encoded: ', [this.version.toString(), this.payloadType.toString(), this.payload.asArray()])

    return bs58check.encode(rlp.encode([this.version.toString(), this.payloadType.toString(), this.payload.asArray() as any]) as any)
  }

  public static create(data: IACMessageDefinition[], chunkSize: number = 0): IACProtocol[] {
    const payload: FullPayload = new FullPayload(PayloadType.DECODED, data)

    const rawPayload: Buffer = payload.asBuffer()

    if (chunkSize > 0 && rawPayload.length > chunkSize) {
      const chunks: Buffer[] = []
      const nodeBuffer: Buffer = rawPayload
      const bufferLength: number = rawPayload.length

      let i: number = 0
      console.log('BUFFER LENGTH', bufferLength, 'chunkSize', chunkSize)
      console.log('BUFFER', nodeBuffer)
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
    data.forEach(entry => {
      const decoded: Buffer[] = rlp.decode(bs58check.decode(entry)) as any // Will be fixed with new rlp version
      const version: string = decoded[0].toString()
      const type: string = decoded[1].toString()

      globalType = globalType || type
      if (globalType !== type) {
        throw new Error('NOT SAME TYPE')
      }

      const payload: Buffer[] = (decoded[2] as any) as Buffer[]
      console.log(version, type, payload)

      if (type === '0') {
        // full
        // res.push(new Message(payload as any, {}, '', ''))
        finalPayload = new FullPayload(PayloadType.ENCODED, payload)
      } else if (type === '1') {
        // chunked
        console.log('chunked')
        chunked.push(new ChunkedPayload(PayloadType.ENCODED, payload))
      } else {
        throw new Error('EMPTY ARRAY')
      }
    })

    if (!finalPayload) {
      console.log(chunked)
      const arr = chunked.sort((a, b) => a.currentPage - b.currentPage).map(chunk => chunk.buffer)
      console.log('arr', arr)

      finalPayload = new FullPayload(PayloadType.ENCODED, rlp.decode(Buffer.concat(arr as any) as any) as any)
    }

    console.log('finalPayload', finalPayload)

    return [new IACProtocol(PayloadType.DECODED, finalPayload)]
  }
}
