// @ts-ignore
import createHash from '@airgap/coinlib-core/dependencies/src/create-hash-1.2.0' // TODO: check if it can be replaced with `crypto.createHash`

export function hash160(data: string | Uint8Array | Buffer): Buffer {
  const sha256Hash = createHash('sha256').update(data).digest()
  try {
    return createHash('rmd160').update(sha256Hash).digest()
  } catch {
    return createHash('ripemd160').update(sha256Hash).digest()
  }
}
