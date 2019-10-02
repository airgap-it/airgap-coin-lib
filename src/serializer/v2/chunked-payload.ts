import { assertNever } from './message'
import { Payload, PayloadType } from './payload'

export class ChunkedPayload implements Payload {
  public currentPage: number
  public total: number
  public buffer: Buffer

  constructor(type: PayloadType, object: Buffer[] | { currentPage: number; total: number; payload: Buffer }) {
    if (type === PayloadType.DECODED) {
      const x = object as { currentPage: number; total: number; payload: Buffer }
      this.currentPage = x.currentPage
      this.total = x.total
      this.buffer = x.payload
    } else if (type === PayloadType.ENCODED) {
      console.log('GETTING NEW CHUNKED PAYLOAD AS BUFFER', object)
      const x: Buffer[] = (object as any) as Buffer[]
      this.currentPage = parseInt(x[0].toString(), 10)
      this.total = parseInt(x[1].toString(), 10)
      this.buffer = x[2]
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }
  }

  public asArray() {
    return [this.currentPage.toString(), this.total.toString(), this.buffer.toString()]
  }
}
