import { hmac } from 'hashes-grs/hmac';
import { ripemd160 } from 'hashes-grs/ripemd160';
import { sha256 } from 'hashes-grs/sha256';
import { sha512 } from 'hashes-grs/sha512';

export function hash160(buffer: Buffer): Buffer {
  const sha256Hash = sha256(Uint8Array.from(buffer));
  return Buffer.from(ripemd160(sha256Hash));
}

export function hmacSHA512(key: Buffer, data: Buffer): Buffer {
  return Buffer.from(hmac(sha512, key, data));
}
