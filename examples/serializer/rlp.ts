// tslint:disable:no-any
// tslint:disable:no-console

import * as bs58check from '../../packages/core/src/dependencies/src/bs58check-2.1.2'
import * as rlp from '../../packages/core/src/dependencies/src/rlp-2.2.3/index'

const encoded: string = bs58check.encode(
  rlp.encode([
    '1', // Protocol Version
    '1', // SerializationType: Full or Chunked
    [
      // Array of Messages
      [
        '1', // Coin Protocol Version
        '2', // MessageType
        'ae', // Protocol
        'payload' // Payload depending on the MessageType
      ],
      [
        '1', // Coin Protocol Version
        '3', // MessageType
        'ae', // Protocol
        'payload' // Payload depending on the MessageType
      ]
    ]
  ])
)
console.log('Encoded RLP:', encoded)

const decoded: any[] = rlp.decode(bs58check.decode(encoded))

console.log(
  'Decoded RLP:',
  decoded.map((x: Buffer) => x.toString())
)
