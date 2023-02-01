// import { PipeArrayBuffer } from './buffer'

// function eob(): never {
//   throw new Error('unexpected end of buffer')
// }

// export function safeRead(pipe: PipeArrayBuffer, num: number): ArrayBuffer {
//   if (pipe.byteLength < num) {
//     eob()
//   }
//   return pipe.read(num)
// }

// export function safeReadUint8(pipe: PipeArrayBuffer): number {
//   const byte = pipe.readUint8()
//   if (byte === undefined) {
//     eob()
//   }
//   return byte
// }

// export function lebEncode(value: bigint | number): ArrayBuffer {
//   if (typeof value === 'number') {
//     value = BigInt(value)
//   }

//   if (value < BigInt(0)) {
//     throw new Error('Cannot leb encode negative values.')
//   }

//   const byteLength = (value === BigInt(0) ? 0 : Math.ceil(Math.log2(Number(value)))) + 1
//   const pipe = new PipeArrayBuffer(new ArrayBuffer(byteLength), 0)
//   while (true) {
//     const i = Number(value & BigInt(0x7f))
//     value /= BigInt(0x80)
//     if (value === BigInt(0)) {
//       pipe.write(new Uint8Array([i]))
//       break
//     } else {
//       pipe.write(new Uint8Array([i | 0x80]))
//     }
//   }

//   return pipe.buffer
// }

// export function slebEncode(value: bigint | number): ArrayBuffer {
//   if (typeof value === 'number') {
//     value = BigInt(value)
//   }

//   const isNeg = value < BigInt(0)
//   if (isNeg) {
//     value = -value - BigInt(1)
//   }
//   const byteLength = (value === BigInt(0) ? 0 : Math.ceil(Math.log2(Number(value)))) + 1
//   const pipe = new PipeArrayBuffer(new ArrayBuffer(byteLength), 0)
//   while (true) {
//     const i = getLowerBytes(value)
//     value /= BigInt(0x80)

//     // prettier-ignore
//     if (   ( isNeg && value === BigInt(0) && (i & 0x40) !== 0)
//             || (!isNeg && value === BigInt(0) && (i & 0x40) === 0)) {
//           pipe.write(new Uint8Array([i]));
//           break;
//         } else {
//           pipe.write(new Uint8Array([i | 0x80]));
//         }
//   }

//   function getLowerBytes(num: bigint): number {
//     const bytes = num % BigInt(0x80)
//     if (isNeg) {
//       // We swap the bits here again, and remove 1 to do two's complement.
//       return Number(BigInt(0x80) - bytes - BigInt(1))
//     } else {
//       return Number(bytes)
//     }
//   }
//   return pipe.buffer
// }

// export function lebDecode(pipe: PipeArrayBuffer): bigint {
//   let weight = BigInt(1)
//   let value = BigInt(0)
//   let byte

//   do {
//     byte = safeReadUint8(pipe)
//     value += BigInt(byte & 0x7f).valueOf() * weight
//     weight *= BigInt(128)
//   } while (byte >= 0x80)

//   return value
// }

// export function slebDecode(pipe: PipeArrayBuffer): bigint {
//   // Get the size of the buffer, then cut a buffer of that size.
//   const pipeView = new Uint8Array(pipe.buffer)
//   let len = 0
//   for (; len < pipeView.byteLength; len++) {
//     if (pipeView[len] < 0x80) {
//       // If it's a positive number, we reuse lebDecode.
//       if ((pipeView[len] & 0x40) === 0) {
//         return lebDecode(pipe)
//       }
//       break
//     }
//   }

//   const bytes = new Uint8Array(safeRead(pipe, len + 1))
//   let value = BigInt(0)
//   for (let i = bytes.byteLength - 1; i >= 0; i--) {
//     value = value * BigInt(0x80) + BigInt(0x80 - (bytes[i] & 0x7f) - 1)
//   }
//   return -value - BigInt(1)
// }
