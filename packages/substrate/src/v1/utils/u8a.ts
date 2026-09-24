/**
 * Byte-array helpers for the sr25519 message-signing path.
 *
 * These replace the two functions that were imported from `@polkadot/util` (`assert`, `u8aToU8a`),
 * which was the package's only use of that dependency. The behaviour is kept identical to
 * @polkadot/util 2.0.1 so existing signatures and verifications do not change:
 *
 *  - a `0x`-prefixed, even-length hex string is decoded as hex;
 *  - any other string is UTF-8 encoded;
 *  - Buffers / Uint8Arrays are returned as a plain Uint8Array view;
 *  - number arrays are copied;
 *  - `undefined`, `null` and `''` become an empty array.
 */

const HEX_REGEX: RegExp = /^0x[a-fA-F0-9]+$/

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

export function isHex(value: unknown): value is string {
  return value === '0x' || (typeof value === 'string' && HEX_REGEX.test(value) && value.length % 2 === 0)
}

export function hexToU8a(value: string): Uint8Array {
  if (!value) {
    return new Uint8Array()
  }
  assert(isHex(value), `Expected hex value to convert, found '${value}'`)

  return Uint8Array.from(Buffer.from(value.slice(2), 'hex'))
}

export function stringToU8a(value: string): Uint8Array {
  if (!value) {
    return new Uint8Array()
  }

  return Uint8Array.from(Buffer.from(value, 'utf8'))
}

export function u8aToU8a(value?: string | Uint8Array | ArrayLike<number> | null): Uint8Array {
  if (!value) {
    return new Uint8Array()
  }
  if (value instanceof Uint8Array) {
    // Buffers are Uint8Arrays; expose the same bytes without copying, as @polkadot/util did.
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }
  if (typeof value === 'string') {
    return isHex(value) ? hexToU8a(value) : stringToU8a(value)
  }

  return Uint8Array.from(value)
}
