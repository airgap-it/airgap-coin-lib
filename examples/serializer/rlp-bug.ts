// tslint:disable:no-any
// tslint:disable:no-console

import * as rlp from '../../packages/core/src/dependencies/src/rlp-2.2.3/index'

const encoded: Buffer = rlp.encode([
  '1234', // string
  '0x1234', // hex string
  '0x1X34', // invalid hex string
  0x1234 // hex number
])

const decoded: any[] = rlp.decode(encoded)

// RLP strips away the "0x" for strings, which results in errors

console.log('0', decoded[0].toString()) // "1234"
console.log('1', decoded[1].toString()) // "4" because it was handled as hex
console.log('2', decoded[2].toString()) // "" because it had invalid characters and failed
console.log('3', decoded[3].toString()) // "4" because it was handled as hex

console.log('')

console.log('0', decoded[0].toString('hex')) // "31323334" because now the string is interpreted as hex
console.log('1', decoded[1].toString('hex')) // "1234"
console.log('2', decoded[2].toString('hex')) // "" because it had invalid characters and failed
console.log('3', decoded[3].toString('hex')) // "1234"
