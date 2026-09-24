import { hmac } from '../../@noble/hashes-1.8.0/src/hmac';
import { ripemd160 } from '../../@noble/hashes-1.8.0/src/ripemd160';
import { sha256 } from '../../@noble/hashes-1.8.0/src/sha256';
import { sha512 } from '../../@noble/hashes-1.8.0/src/sha512';

export function hash160(buffer: Uint8Array): Uint8Array {
  return ripemd160(sha256(buffer));
}

export function hmacSHA512(key: Uint8Array, data: Uint8Array): Uint8Array {
  return hmac(sha512, key, data);
}
