import { buf as crc32Buffer } from 'crc-32'

import { Tokens } from '../types/ledger'

export function uint8ArrayToHexString(arr: Uint8Array): string {
  let hexStr = ''
  for (let i = 0; i < arr.length; i++) {
    let hex = (arr[i] & 0xff).toString(16)
    hex = hex.length === 1 ? '0' + hex : hex
    hexStr += hex
  }
  return hexStr
}

export function hexStringToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    hexString = '0' + hexString
  }
  let arrayBuffer = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < hexString.length; i += 2) {
    arrayBuffer[i / 2] = parseInt(hexString.substring(i, i + 2), 16)
  }
  return arrayBuffer
}

export function arrayBufferToHexString(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export function hexStringToArrayBuffer(hex: string): ArrayBuffer {
  const hexRe = new RegExp(/^([0-9A-F]{2})*$/i)

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

export const calculateCrc32 = (bytes: Uint8Array): Buffer => {
  const checksumArrayBuf = new ArrayBuffer(4)
  const view = new DataView(checksumArrayBuf)
  view.setUint32(0, crc32Buffer(Buffer.from(bytes)), false)
  return Buffer.from(checksumArrayBuf)
}

export const e8sToTokens = (e8s: bigint): Tokens => ({ e8s })

export const asciiStringToByteArray = (text: string): Array<number> => Array.from(text).map((c) => c.charCodeAt(0))

export const uint8ArrayToBigInt = (array: Uint8Array): bigint => {
  const view = new DataView(array.buffer, array.byteOffset, array.byteLength)
  if (typeof view.getBigUint64 === 'function') {
    return view.getBigUint64(0)
  } else {
    const high = BigInt(view.getUint32(0))
    const low = BigInt(view.getUint32(4))

    return (high << BigInt(32)) + low
  }
}
