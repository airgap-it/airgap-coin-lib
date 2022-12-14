import { Domain } from '@airgap/coinlib-core'
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { hexToBytes } from '@airgap/coinlib-core/utils/hex'

interface Base58Prefix {
  prefix: string
  bytes: Buffer
  bytesLength: number
  encodedLength: number
}

function createBase58PrefixEntry(prefix: string, bytes: number[], bytesLength: number, encodedLength: number): Base58Prefix {
  return {
    prefix,
    bytes: Buffer.from(new Uint8Array(bytes)),
    bytesLength,
    encodedLength
  }
}

export const BASE58_PREFIX = {
  operationHash: createBase58PrefixEntry('o', [5, 116], 32, 51), // o(51)
  operationListHash: createBase58PrefixEntry('Lo', [133, 233], 32, 52), // Lo(52)
  operationListListHash: createBase58PrefixEntry('LLo', [29, 159, 109], 32, 53), // LLo(53)

  blockHash: createBase58PrefixEntry('B', [1, 52], 32, 51), // B(51)
  protocolHash: createBase58PrefixEntry('P', [2, 170], 32, 51), // P(51)
  contextHash: createBase58PrefixEntry('Co', [79, 199], 32, 52), // Co(52)
  nonceHash: createBase58PrefixEntry('nce', [69, 220, 169], 32, 52), // nce(52)
  scriptExprHash: createBase58PrefixEntry('expr', [13, 44, 64, 27], 32, 54), // expr(54)
  randomHash: createBase58PrefixEntry('rng', [76, 64, 204], 32, 53), // rng(53)

  blockMetadataHash: createBase58PrefixEntry('bm', [234, 249], 32, 52), // bm(52)
  blockPayloadHash: createBase58PrefixEntry('vh', [1, 106, 242], 32, 52), // vh(52)

  operationMetadataHash: createBase58PrefixEntry('r', [5, 183], 32, 51), // r(51)
  operationMetadataListHash: createBase58PrefixEntry('Lr', [134, 39], 32, 52), // Lr(52)
  operationMetadataListListHash: createBase58PrefixEntry('LLr', [29, 159, 182], 32, 53), // LLr(53)

  ed25519PublicKeyHash: createBase58PrefixEntry('tz1', [6, 161, 159], 20, 36), // tz1(36)
  secp256K1PublicKeyHash: createBase58PrefixEntry('tz2', [6, 161, 161], 20, 36), // tz2(36)
  p256PublicKeyHash: createBase58PrefixEntry('tz3', [6, 161, 164], 20, 36), // tz3(36)
  contractHash: createBase58PrefixEntry('KT1', [2, 90, 121], 20, 36), // KT1(36)

  cryptoboxPublicKeyHash: createBase58PrefixEntry('id', [153, 103], 16, 30), // id(30)

  ed25519Seed: createBase58PrefixEntry('edsk', [13, 15, 58, 7], 32, 54), // edsk(54)
  ed25519EncryptedSeed: createBase58PrefixEntry('edesk', [7, 90, 60, 179, 41], 56, 88), // edesk(88)

  ed25519SecretKey: createBase58PrefixEntry('edsk', [43, 246, 78, 7], 64, 98), // edsk(98)
  secp256K1SecretKey: createBase58PrefixEntry('spsk', [17, 162, 224, 201], 32, 54), // spsk(54)
  p256SecretKey: createBase58PrefixEntry('p2sk', [16, 81, 238, 189], 32, 54), // p2sk(54)

  secp256K1EncryptedSecretKey: createBase58PrefixEntry('spesk', [9, 237, 241, 174, 150], 56, 88), // spesk(88)
  p256EncryptedSecretKey: createBase58PrefixEntry('p2esk', [9, 48, 57, 115, 171], 56, 88), // p2esk(88)

  secp256K1Scalar: createBase58PrefixEntry('SSp', [38, 248, 136], 32, 53), // SSp(53)
  secp256K1EncryptedScalar: createBase58PrefixEntry('seesk', [1, 131, 36, 86, 248], 60, 93), // seesk(93)
  secp256K1Element: createBase58PrefixEntry('GSp', [5, 92, 0], 33, 54), // GSp(54)

  ed25519PublicKey: createBase58PrefixEntry('edpk', [13, 15, 37, 217], 32, 54), // edpk(54)
  secp256K1PublicKey: createBase58PrefixEntry('sppk', [3, 254, 226, 86], 33, 55), // sppk(55)
  p256PublicKey: createBase58PrefixEntry('p2pk', [3, 178, 139, 127], 33, 55), // p2pk(55)

  ed25519BlindedPublicKeyHash: createBase58PrefixEntry('btz1', [1, 2, 49, 223], 20, 37), // btz1(37)

  ed25519Signature: createBase58PrefixEntry('edsig', [9, 245, 205, 134, 18], 64, 99), // edsig(99)
  secp256K1Signature: createBase58PrefixEntry('spsig1', [13, 115, 101, 19, 63], 64, 99), // spsig1(99)
  p256Signature: createBase58PrefixEntry('p2sig', [54, 240, 44, 52], 64, 98), // p2sig(98)
  genericSignature: createBase58PrefixEntry('sig', [4, 130, 43], 64, 96), // sig(96)

  chainId: createBase58PrefixEntry('Net', [87, 82, 0], 4, 15), // Net(15)

  saplingSpendingKey: createBase58PrefixEntry('sask', [11, 237, 20, 92], 169, 41), // sask(241)
  saplingAddress: createBase58PrefixEntry('zet1', [18, 71, 40, 223], 43, 69) // zet1(69)
}

export function encodeBase58(bytes: string | Uint8Array | Buffer, type: keyof typeof BASE58_PREFIX): string {
  const buffer: Buffer = hexToBytes(bytes)
  const prefix: Base58Prefix = BASE58_PREFIX[type]
  if (buffer.length !== prefix.bytesLength) {
    throw new ConditionViolationError(Domain.TEZOS, `Invalid ${type} bytes`)
  }

  const encoded: string = bs58check.encode(Buffer.concat([prefix.bytes, buffer]))
  if (!encoded.startsWith(prefix.prefix) || encoded.length !== prefix.encodedLength) {
    throw new ConditionViolationError(Domain.TEZOS, `Invalid ${type} bytes`)
  }

  return encoded
}

export function decodeBase58(value: string, type?: keyof typeof BASE58_PREFIX): Buffer {
  const prefix: Base58Prefix | undefined =
    type !== undefined ? BASE58_PREFIX[type] : Object.values(BASE58_PREFIX).find((prefix: Base58Prefix) => value.startsWith(prefix.prefix))

  if (prefix === undefined || !value.startsWith(prefix.prefix) || value.length !== prefix.encodedLength) {
    throw new UnsupportedError(Domain.TEZOS, `Unknown base58 encoded value ${value}`)
  }

  const decoded: Buffer = bs58check.decode(value)

  return decoded.slice(prefix.bytes.length)
}
