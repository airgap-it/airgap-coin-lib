'use strict'

import { sha256 } from '../../@noble/hashes-1.8.0/src/sha256'
import bs58checkBase from './base'

// SHA256(SHA256(buffer))
function sha256x2 (buffer: Uint8Array | string): Uint8Array {
  return sha256(sha256(buffer))
}

export default bs58checkBase(sha256x2)
