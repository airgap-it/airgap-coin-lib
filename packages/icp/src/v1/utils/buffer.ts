/**
 * Concatenate multiple array buffers.
 * @param buffers The buffers to concatenate.
 */
export function concat(...buffers: ArrayBuffer[]): ArrayBuffer {
  const result = new Uint8Array(buffers.reduce((acc, curr) => acc + curr.byteLength, 0))
  let index = 0
  for (const b of buffers) {
    result.set(new Uint8Array(b), index)
    index += b.byteLength
  }
  return result
}

/**
 * Returns an hexadecimal representation of an array buffer.
 * @param bytes The array buffer.
 */
export function toHexString(bytes: ArrayBuffer): string {
  return new Uint8Array(bytes).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')
}

/**
 * Return an array buffer from its hexadecimal representation.
 * @param hexString The hexadecimal string.
 */
export function fromHexString(hexString: string): ArrayBuffer {
  return new Uint8Array((hexString.match(/.{1,2}/g) ?? []).map((byte) => parseInt(byte, 16)))
}

/**
 * A class that abstracts a pipe-like ArrayBuffer.
 */
export class PipeArrayBuffer {
  /**
   * The reading view. It's a sliding window as we read and write, pointing to the buffer.
   * @private
   */
  private _view: Uint8Array

  /**
   * The actual buffer containing the bytes.
   * @private
   */
  private _buffer: ArrayBuffer

  /**
   * Creates a new instance of a pipe
   * @param buffer an optional buffer to start with
   * @param length an optional amount of bytes to use for the length.
   */
  constructor(buffer?: ArrayBuffer, length = buffer?.byteLength || 0) {
    this._buffer = buffer || new ArrayBuffer(0)
    this._view = new Uint8Array(this._buffer, 0, length)
  }

  get buffer(): ArrayBuffer {
    // Return a copy of the buffer.
    return this._view.slice()
  }

  get byteLength(): number {
    return this._view.byteLength
  }

  /**
   * Read `num` number of bytes from the front of the pipe.
   * @param num The number of bytes to read.
   */
  public read(num: number): ArrayBuffer {
    const result = this._view.subarray(0, num)
    this._view = this._view.subarray(num)
    return result.slice().buffer
  }

  public readUint8(): number | undefined {
    const result = this._view[0]
    this._view = this._view.subarray(1)
    return result
  }

  /**
   * Write a buffer to the end of the pipe.
   * @param buf The bytes to write.
   */
  public write(buf: ArrayBuffer): void {
    const b = new Uint8Array(buf)
    const offset = this._view.byteLength
    if (this._view.byteOffset + this._view.byteLength + b.byteLength >= this._buffer.byteLength) {
      // Alloc grow the view to include the new bytes.
      this.alloc(b.byteLength)
    } else {
      // Update the view to include the new bytes.
      this._view = new Uint8Array(this._buffer, this._view.byteOffset, this._view.byteLength + b.byteLength)
    }

    this._view.set(b, offset)
  }

  /**
   * Whether or not there is more data to read from the buffer
   */
  public get end(): boolean {
    return this._view.byteLength === 0
  }

  /**
   * Allocate a fixed amount of memory in the buffer. This does not affect the view.
   * @param amount A number of bytes to add to the buffer.
   */
  public alloc(amount: number) {
    // Add a little bit of exponential growth.
    // tslint:disable-next-line:no-bitwise
    const b = new ArrayBuffer(((this._buffer.byteLength + amount) * 1.2) | 0)
    const v = new Uint8Array(b, 0, this._view.byteLength + amount)
    v.set(this._view)
    this._buffer = b
    this._view = v
  }
}

export function zipWith<TX, TY, TR>(xs: TX[], ys: TY[], f: (a: TX, b: TY) => TR): TR[] {
  return xs.map((x, i) => f(x, ys[i]))
}

/**
 * Transforms a buffer to an hexadecimal string. This will use the buffer as an Uint8Array.
 * @param buffer The buffer to return the hexadecimal string of.
 */
export function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

const hexRe = new RegExp(/^([0-9A-F]{2})*$/i)

/**
 * Transforms a hexadecimal string into an array buffer.
 * @param hex The hexadecimal string to use.
 */
export function fromHex(hex: string): ArrayBuffer {
  if (!hexRe.test(hex)) {
    throw new Error('Invalid hexadecimal string.')
  }
  const buffer = [...hex]
    .reduce((acc, curr, i) => {
      // tslint:disable-next-line:no-bitwise
      acc[(i / 2) | 0] = (acc[(i / 2) | 0] || '') + curr
      return acc
    }, [] as string[])
    .map((x) => Number.parseInt(x, 16))

  return new Uint8Array(buffer).buffer
}

export function compare(b1: ArrayBuffer, b2: ArrayBuffer): number {
  if (b1.byteLength !== b2.byteLength) {
    return b1.byteLength - b2.byteLength
  }

  const u1 = new Uint8Array(b1)
  const u2 = new Uint8Array(b2)
  for (let i = 0; i < u1.length; i++) {
    if (u1[i] !== u2[i]) {
      return u1[i] - u2[i]
    }
  }
  return 0
}
