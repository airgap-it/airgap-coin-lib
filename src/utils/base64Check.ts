import * as createHash from '../dependencies/src/create-hash-1.2.0/index'

const sha256hash = input => {
  const hash = createHash('sha256')
  hash.update(input)

  return hash.digest()
}

const checkSum = (payload: Buffer | string) => {
  return sha256hash(sha256hash(payload)).slice(0, 4)
}

const bs64check = {
  encode(input: any): string {
    if (!Buffer.isBuffer(input)) {
      input = Buffer.from(input)
    }

    const checksum = checkSum(input)
    const payloadWithChecksum = Buffer.concat([input, checksum], input.length + 4)

    return payloadWithChecksum.toString('base64')
  },
  decode(input: Buffer | string): any {
    if (!Buffer.isBuffer(input)) {
      input = Buffer.from(input, 'base64')
    }

    const payload = input.slice(0, -4)
    const checksum = input.slice(-4)
    const newChecksum = checkSum(payload)

    // tslint:disable-next-line:no-bitwise
    if ((checksum[0] ^ newChecksum[0]) | (checksum[1] ^ newChecksum[1]) | (checksum[2] ^ newChecksum[2]) | (checksum[3] ^ newChecksum[3])) {
      throw new Error('bs64check checksum does not match')
    }

    return payload
  },
  checkSum
}

export default bs64check
