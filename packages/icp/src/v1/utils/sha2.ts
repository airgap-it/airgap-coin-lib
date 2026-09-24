/**
 * `js-sha256`-shaped sha224 / sha256 hashers on top of the vendored `@noble/hashes`.
 *
 * Replaces the npm `js-sha256` dependency. Only the surface icp uses is provided:
 * `create()`, chained `update()` accepting number arrays, ArrayBuffers, Uint8Arrays or strings,
 * and `array()` / `digest()` (number[]) / `arrayBuffer()` for the result. noble only accepts
 * Uint8Array input, so the conversion happens here.
 */
import { sha224 as nobleSha224, sha256 as nobleSha256 } from '@airgap/coinlib-core/dependencies/src/@noble/hashes-1.8.0/src/sha2'

export type Sha2Input = string | ArrayBuffer | ArrayLike<number>

function toBytes(data: Sha2Input): Uint8Array {
  if (data instanceof Uint8Array) {
    return data
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data)
  }
  if (typeof data === 'string') {
    return Uint8Array.from(Buffer.from(data, 'utf8'))
  }

  return Uint8Array.from(data)
}

export class Sha2Hasher {
  constructor(private readonly hash: { update(data: Uint8Array): unknown; digest(): Uint8Array }) {}

  public update(data: Sha2Input): this {
    this.hash.update(toBytes(data))

    return this
  }

  /** Digest as a plain number array (js-sha256 `array()` / `digest()`). */
  public array(): number[] {
    return Array.from(this.hash.digest())
  }

  public digest(): number[] {
    return this.array()
  }

  public arrayBuffer(): ArrayBuffer {
    const digest: Uint8Array = this.hash.digest()

    return digest.buffer.slice(digest.byteOffset, digest.byteOffset + digest.byteLength) as ArrayBuffer
  }
}

export const sha224 = {
  create: (): Sha2Hasher => new Sha2Hasher(nobleSha224.create())
}

export const sha256 = {
  create: (): Sha2Hasher => new Sha2Hasher(nobleSha256.create())
}
