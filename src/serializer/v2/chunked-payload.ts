import { assertNever } from './message'
import { Payload, PayloadType } from './payload'

interface DecodedChunkedPayload {
  currentPage: number
  total: number
  payload: Buffer
}

interface PayloadTypeReturnType {
  [PayloadType.ENCODED]: Buffer[]
  [PayloadType.DECODED]: DecodedChunkedPayload
}

function isBufferArray(arg: unknown): arg is Buffer[] {
  return Array.isArray(arg) && arg.every(el => el instanceof Buffer);
}

function isDecodedChunkedPayload(arg: unknown): arg is DecodedChunkedPayload {
  // TODO: How can we detect if the interface changed?
  if (!isObject(arg)) {
    return false
  }

  if (arg.currentPage === undefined || arg.total === undefined || arg.payload === undefined) {
    return false
  }

  return true
}

function isObject(arg: unknown): arg is { [key: string]: unknown } {
  return typeof arg === 'object'
}

function getIntFromBuffer(buffer: Buffer) {
  return parseInt(buffer.toString(), 10)
}

export class ChunkedPayload implements Payload {
  public currentPage: number
  public total: number
  public buffer: Buffer

  constructor(type: PayloadType, object: PayloadTypeReturnType[PayloadType]) {
    if (type === PayloadType.DECODED) {
      console.log('ChunkedPayload constructor - DECODED PAYLOAD')
      if (!isDecodedChunkedPayload(object)) {
        console.log('obj test', object)
        throw new Error('UNEXPECTED TYPE OF PAYLOAD IN CHUNKED PAYLOAD CONSTRUCTOR')
      }
      this.currentPage = object.currentPage
      this.total = object.total
      this.buffer = object.payload
    } else if (type === PayloadType.ENCODED) {
      console.log('ChunkedPayload constructor - ENCODED PAYLOAD')
      if (!isBufferArray(object)) {
        console.log('obj test', object)
        throw new Error('UNEXPECTED TYPE OF PAYLOAD IN CHUNKED PAYLOAD CONSTRUCTOR')
      }
      if (object.length !== 3) {
        throw new Error('INVALID CHUNKED PAYLOAD, NOT THE RIGHT AMOUNT OF ELEMENTS IN ARRAY')
      }

      // We know here that the buffer has the following signature
      // [currentPage, totalPages, payload]: [Buffer, Buffer, Buffer]

      this.currentPage = getIntFromBuffer(object[0])
      this.total = getIntFromBuffer(object[1])
      this.buffer = object[2]
    } else {
      assertNever(type)
      throw new Error('UNKNOWN PAYLOAD TYPE')
    }

    console.log(`ChunkedPayload constructor - Page: ${this.currentPage}/${this.total}, Buffer: ${this.buffer}`)
  }

  public asArray() {
    return [this.currentPage.toString(), this.total.toString(), this.buffer]
  }
}
