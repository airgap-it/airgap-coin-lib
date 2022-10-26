import { SerializerError, SerializerErrorType } from '@airgap/coinlib-core/errors'

import { RLPData } from '../utils/toBuffer'

import { Payload } from './payload'

interface DecodedChunkedPayload {
  currentPage: number
  total: number
  payload: Buffer
}

function isBufferArray(arg: unknown): arg is Buffer[] {
  return Array.isArray(arg) && arg.every((el: unknown) => el instanceof Buffer)
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

function getIntFromBuffer(buffer: Buffer): number {
  return parseInt(buffer.toString(), 10)
}

export class ChunkedPayload implements Payload {
  public currentPage: number
  public total: number
  public buffer: Buffer

  constructor(currentPage: number, total: number, buffer: Buffer) {
    this.currentPage = currentPage
    this.total = total
    this.buffer = buffer
  }

  public static fromDecoded(object: DecodedChunkedPayload): ChunkedPayload {
    if (!isDecodedChunkedPayload(object)) {
      throw new SerializerError(SerializerErrorType.UNEXPECTED_PAYLOAD, `Object does not match "Chunked serializer" interface`)
    }

    return new ChunkedPayload(object.currentPage, object.total, object.payload)
  }
  public static fromEncoded(buf: [Buffer, Buffer, Buffer]): ChunkedPayload {
    if (!isBufferArray(buf)) {
      throw new SerializerError(SerializerErrorType.UNEXPECTED_PAYLOAD, `Input value is not a buffer array`)
    }
    if (buf.length !== 3) {
      throw new SerializerError(SerializerErrorType.UNEXPECTED_PAYLOAD, `Input value does not have the right length`)
    }

    // We know here that the buffer has the following signature
    // [currentPage, totalPages, payload]: [Buffer, Buffer, Buffer]

    const currentPage: number = getIntFromBuffer(buf[0])
    const total: number = getIntFromBuffer(buf[1])
    const payload: Buffer = buf[2]

    return new ChunkedPayload(currentPage, total, payload)
  }

  public asArray(): RLPData {
    return [this.currentPage.toString(), this.total.toString(), this.buffer]
  }
}
